const DeleteReplyUseCase = require("../DeleteReplyUseCase");

describe("DeleteReplyUseCase", () => {
    it("should orchestrate delete reply correctly", async () => {
        // Arrange
        const threadId = "thread-123";
        const commentId = "comment-123";
        const replyId = "reply-123";
        const owner = "user-123";

        // Mocking
        const mockThreadRepository = {
            verifyThreadExists: jest.fn().mockResolvedValue(),
        };

        const mockCommentRepository = {
            verifyCommentExists: jest.fn().mockResolvedValue(),
        };

        const mockReplyRepository = {
            verifyReplyExists: jest.fn().mockResolvedValue(),
            verifyReplyOwner: jest.fn().mockResolvedValue(),
            deleteReplyById: jest.fn().mockResolvedValue(),
        };

        const deleteReplyUseCase = new DeleteReplyUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        // Action
        await deleteReplyUseCase.execute({
            threadId,
            commentId,
            replyId,
            owner,
        });

        // Assert
        expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
            threadId
        );
        expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(
            commentId
        );
        expect(mockReplyRepository.verifyReplyExists).toHaveBeenCalledWith(
            replyId
        );
        expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
            replyId,
            owner
        );
        expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledWith(
            replyId
        );
    });
});
