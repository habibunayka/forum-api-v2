const AddReplyUseCase = require("../AddReplyUseCase");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");

describe("AddReplyUseCase", () => {
    it("should orchestrate the add reply use case correctly", async () => {
        // Arrange
        const useCasePayload = {
            content: "sebuah balasan",
            owner: "user-123",
            commentId: "comment-123",
            threadId: "thread-123",
        };

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockReplyRepository = new ReplyRepository();

        // Mocking
        mockThreadRepository.verifyThreadExists = jest.fn(() =>
            Promise.resolve()
        );
        mockCommentRepository.verifyCommentExists = jest.fn(() =>
            Promise.resolve()
        );
        mockReplyRepository.addReply = jest.fn(() =>
            Promise.resolve({
                id: "reply-123",
                content: useCasePayload.content,
                owner: useCasePayload.owner,
            })
        );

        const addReplyUseCase = new AddReplyUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        // Action
        const addedReply = await addReplyUseCase.execute(useCasePayload);

        // Assert
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
            useCasePayload.threadId
        );
        expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
            useCasePayload.commentId
        );
        expect(mockReplyRepository.addReply).toBeCalledWith(
            new NewReply({
                content: useCasePayload.content,
                owner: useCasePayload.owner,
                commentId: useCasePayload.commentId,
            })
        );
        expect(addedReply).toMatchObject(
            new AddedReply({
                id: "reply-123",
                content: useCasePayload.content,
                owner: useCasePayload.owner,
            })
        );
    });
});
