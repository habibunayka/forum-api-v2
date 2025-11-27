const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("PUT /threads/{threadId}/comments/{commentId}/likes", () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
    });

    it("should toggle like and unlike a comment and reflect likeCount in thread detail", async () => {
        const server = await createServer(container);

        // register user
        await server.inject({
            method: "POST",
            url: "/users",
            payload: {
                username: "liker",
                password: "secret",
                fullname: "Liker User",
            },
        });

        const loginResponse = await server.inject({
            method: "POST",
            url: "/authentications",
            payload: {
                username: "liker",
                password: "secret",
            },
        });
        const {
            data: { accessToken },
        } = JSON.parse(loginResponse.payload);

        const threadResponse = await server.inject({
            method: "POST",
            url: "/threads",
            payload: {
                title: "Thread title",
                body: "Thread body",
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

        const commentResponse = await server.inject({
            method: "POST",
            url: `/threads/${threadId}/comments`,
            payload: {
                content: "A comment to like",
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const commentId =
            JSON.parse(commentResponse.payload).data.addedComment.id;

        const likeResponse = await server.inject({
            method: "PUT",
            url: `/threads/${threadId}/comments/${commentId}/likes`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        expect(likeResponse.statusCode).toEqual(200);

        const threadDetailAfterLike = await server.inject({
            method: "GET",
            url: `/threads/${threadId}`,
        });
        const detailAfterLike = JSON.parse(threadDetailAfterLike.payload).data
            .thread;
        expect(detailAfterLike.comments[0].likeCount).toEqual(1);

        const unlikeResponse = await server.inject({
            method: "PUT",
            url: `/threads/${threadId}/comments/${commentId}/likes`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        expect(unlikeResponse.statusCode).toEqual(200);

        const threadDetailAfterUnlike = await server.inject({
            method: "GET",
            url: `/threads/${threadId}`,
        });
        const detailAfterUnlike = JSON.parse(threadDetailAfterUnlike.payload)
            .data.thread;
        expect(detailAfterUnlike.comments[0].likeCount).toEqual(0);
    });
});
