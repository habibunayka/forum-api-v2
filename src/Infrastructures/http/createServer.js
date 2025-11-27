const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

const ClientError = require("../../Commons/exceptions/ClientError");
const DomainErrorTranslator = require("../../Commons/exceptions/DomainErrorTranslator");

const users = require("../../Interfaces/http/api/users");
const authentications = require("../../Interfaces/http/api/authentications");
const threads = require("../../Interfaces/http/api/threads");
const comments = require("../../Interfaces/http/api/comments");
const replies = require("../../Interfaces/http/api/replies");

const createServer = async (container) => {
    const parsePositiveInt = (value, fallback) => {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };

    const threadsRateLimit = parsePositiveInt(
        process.env.THREADS_RATE_LIMIT,
        90
    );
    const threadsRateWindowMs = parsePositiveInt(
        process.env.THREADS_RATE_WINDOW_MS,
        60000
    );
    const threadsRateTracker = new Map();

    const server = Hapi.server({
        host: process.env.HOST,
        port: process.env.PORT,
    });

    await server.register([Jwt]);

    server.auth.strategy("forum_jwt", "jwt", {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    server.ext("onPreHandler", (request, h) => {
        if (!request.path.startsWith("/threads")) {
            return h.continue;
        }

        const requesterIp = request.info.remoteAddress || "anonymous";
        const now = Date.now();
        const currentRecord = threadsRateTracker.get(requesterIp);

        if (
            !currentRecord ||
            now - currentRecord.windowStart >= threadsRateWindowMs
        ) {
            threadsRateTracker.set(requesterIp, {
                count: 1,
                windowStart: now,
            });
            return h.continue;
        }

        if (currentRecord.count >= threadsRateLimit) {
            return h
                .response({
                    status: "fail",
                    message: `Rate limit exceeded on /threads. Allowed ${threadsRateLimit} requests every ${Math.round(
                        threadsRateWindowMs / 1000
                    )} seconds.`,
                })
                .code(429)
                .takeover();
        }

        currentRecord.count += 1;
        return h.continue;
    });

    server.route({
        method: "GET",
        path: "/",
        handler: () => "Hello world",
    });

    await server.register([
        {
            plugin: users,
            options: { container },
        },
        {
            plugin: authentications,
            options: { container },
        },
        {
            plugin: threads,
            options: { container },
        },
        {
            plugin: comments,
            options: { container },
        },
        {
            plugin: replies,
            options: { container },
        },
    ]);

    server.ext("onPreResponse", (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
            const translatedError = DomainErrorTranslator.translate(response);

            if (translatedError instanceof ClientError) {
                const newResponse = h.response({
                    status: "fail",
                    message: translatedError.message,
                });
                newResponse.code(translatedError.statusCode);
                return newResponse;
            }

            if (!translatedError.isServer) {
                return h.continue;
            }

            // Log the error for debugging purposes
            // console.error("[INTERNAL SERVER ERROR]", response); 

            const newResponse = h.response({
                status: "error",
                message: "terjadi kegagalan pada server kami",
            });
            newResponse.code(500);
            return newResponse;
        }

        return h.continue;
    });

    return server;
};

module.exports = createServer;
