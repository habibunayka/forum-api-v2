const Jwt = require("@hapi/jwt");
const createServer = require("../../../../../Infrastructures/http/createServer");
const AddThreadUseCase = require("../../../../../Applications/use_case/AddThreadUseCase");
const GetThreadDetailUseCase = require("../../../../../Applications/use_case/GetThreadDetailUseCase");
const AddCommentUseCase = require("../../../../../Applications/use_case/AddCommentUseCase");
const DeleteCommentUseCase = require("../../../../../Applications/use_case/DeleteCommentUseCase");
const AddReplyUseCase = require("../../../../../Applications/use_case/AddReplyUseCase");
const DeleteReplyUseCase = require("../../../../../Applications/use_case/DeleteReplyUseCase");
const ToggleCommentLikeUseCase = require("../../../../../Applications/use_case/ToggleCommentLikeUseCase");

describe("Threads, comments, and replies handlers", () => {
    const userId = "user-test-123";
    const threadId = "thread-test-123";
    const commentId = "comment-test-123";
    const replyId = "reply-test-123";
    const accessToken = Jwt.token.generate(
        { id: userId },
        process.env.ACCESS_TOKEN_KEY
    );

    let server;
    let fakeContainer;
    let addThreadUseCase;
    let getThreadDetailUseCase;
    let addCommentUseCase;
    let deleteCommentUseCase;
    let addReplyUseCase;
    let deleteReplyUseCase;
    let toggleLikeUseCase;
    let addedThread;
    let threadDetail;
    let addedComment;
    let addedReply;

    beforeEach(async () => {
        addedThread = {
            id: threadId,
            title: "Thread title",
            owner: userId,
        };
        threadDetail = {
            id: threadId,
            title: "Thread title",
            body: "Thread body",
            date: "2021",
            username: "dicoding",
            comments: [],
        };
        addedComment = {
            id: commentId,
            content: "A comment",
            owner: userId,
        };
        addedReply = {
            id: replyId,
            content: "A reply",
            owner: userId,
        };

        addThreadUseCase = {
            execute: jest.fn().mockResolvedValue(addedThread),
        };
        getThreadDetailUseCase = {
            execute: jest.fn().mockResolvedValue(threadDetail),
        };
        addCommentUseCase = {
            execute: jest.fn().mockResolvedValue(addedComment),
        };
        deleteCommentUseCase = {
            execute: jest.fn(),
        };
        addReplyUseCase = {
            execute: jest.fn().mockResolvedValue(addedReply),
        };
        deleteReplyUseCase = {
            execute: jest.fn(),
        };
        toggleLikeUseCase = {
            execute: jest.fn(),
        };

        fakeContainer = {
            getInstance: jest.fn((useCaseName) => {
                const instances = {
                    [AddThreadUseCase.name]: addThreadUseCase,
                    [GetThreadDetailUseCase.name]: getThreadDetailUseCase,
                    [AddCommentUseCase.name]: addCommentUseCase,
                    [DeleteCommentUseCase.name]: deleteCommentUseCase,
                    [AddReplyUseCase.name]: addReplyUseCase,
                    [DeleteReplyUseCase.name]: deleteReplyUseCase,
                    [ToggleCommentLikeUseCase.name]: toggleLikeUseCase,
                };

                if (!instances[useCaseName]) {
                    throw new Error(`Unexpected dependency requested: ${useCaseName}`);
                }

                return instances[useCaseName];
            }),
        };

        server = await createServer(fakeContainer);
    });

    it("should handle POST /threads", async () => {
        const requestPayload = {
            title: "A thread",
            body: "Thread body",
        };

        const response = await server.inject({
            method: "POST",
            url: "/threads",
            payload: requestPayload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual("success");
        expect(responseJson.data.addedThread).toEqual(addedThread);
        expect(addThreadUseCase.execute).toHaveBeenCalledWith(
            requestPayload,
            userId
        );
    });

    it("should handle GET /threads/{threadId}", async () => {
        const response = await server.inject({
            method: "GET",
            url: `/threads/${threadId}`,
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual("success");
        expect(responseJson.data.thread).toEqual(threadDetail);
        expect(getThreadDetailUseCase.execute).toHaveBeenCalledWith(threadId);
    });

    it("should handle POST /threads/{threadId}/comments", async () => {
        const requestPayload = {
            content: addedComment.content,
        };

        const response = await server.inject({
            method: "POST",
            url: `/threads/${threadId}/comments`,
            payload: requestPayload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual("success");
        expect(responseJson.data.addedComment).toEqual(addedComment);
        expect(addCommentUseCase.execute).toHaveBeenCalledWith(
            requestPayload,
            threadId,
            userId
        );
    });

    it("should handle DELETE /threads/{threadId}/comments/{commentId}", async () => {
        const response = await server.inject({
            method: "DELETE",
            url: `/threads/${threadId}/comments/${commentId}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual("success");
        expect(deleteCommentUseCase.execute).toHaveBeenCalledWith(
            threadId,
            commentId,
            userId
        );
    });

    it("should handle POST /threads/{threadId}/comments/{commentId}/replies", async () => {
        const requestPayload = {
            content: addedReply.content,
        };

        const response = await server.inject({
            method: "POST",
            url: `/threads/${threadId}/comments/${commentId}/replies`,
            payload: requestPayload,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual("success");
        expect(responseJson.data.addedReply).toEqual(addedReply);
        expect(addReplyUseCase.execute).toHaveBeenCalledWith({
            threadId,
            commentId,
            owner: userId,
            content: requestPayload.content,
        });
    });

    it("should handle DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", async () => {
        const response = await server.inject({
            method: "DELETE",
            url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual("success");
        expect(deleteReplyUseCase.execute).toHaveBeenCalledWith({
            threadId,
            commentId,
            replyId,
            owner: userId,
        });
    });

    it("should handle PUT /threads/{threadId}/comments/{commentId}/likes", async () => {
        const response = await server.inject({
            method: "PUT",
            url: `/threads/${threadId}/comments/${commentId}/likes`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual("success");
        expect(toggleLikeUseCase.execute).toHaveBeenCalledWith({
            threadId,
            commentId,
            userId,
        });
    });
});
