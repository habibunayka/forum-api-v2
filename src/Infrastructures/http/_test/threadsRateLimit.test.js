const createServer = require("../createServer");
const GetThreadDetailUseCase = require("../../../Applications/use_case/GetThreadDetailUseCase");

describe("/threads rate limiting", () => {
    const threadId = "thread-rate-limit";
    const threadDetail = {
        id: threadId,
        title: "A title",
        body: "Body",
        date: "2021",
        username: "user",
        comments: [],
    };

    it("should return 429 after exceeding 90 requests in a minute", async () => {
        const getThreadDetailUseCase = {
            execute: jest.fn().mockResolvedValue(threadDetail),
        };

        const container = {
            getInstance: jest.fn((useCaseName) => {
                if (useCaseName === GetThreadDetailUseCase.name) {
                    return getThreadDetailUseCase;
                }
                throw new Error(`Unexpected dependency requested: ${useCaseName}`);
            }),
        };

        const server = await createServer(container);

        let lastAllowedResponse;
        for (let attempt = 0; attempt < 90; attempt += 1) {
            lastAllowedResponse = await server.inject({
                method: "GET",
                url: `/threads/${threadId}`,
            });
        }

        const blockedResponse = await server.inject({
            method: "GET",
            url: `/threads/${threadId}`,
        });
        const blockedPayload = JSON.parse(blockedResponse.payload);

        expect(lastAllowedResponse.statusCode).toEqual(200);
        expect(blockedResponse.statusCode).toEqual(429);
        expect(blockedPayload.status).toEqual("fail");
        expect(blockedPayload.message).toMatch(/rate limit/i);
    });
});
