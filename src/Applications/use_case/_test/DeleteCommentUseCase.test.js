const DeleteCommentUseCase = require("../DeleteCommentUseCase");

describe("DeleteCommentUseCase", () => {
    it("should orchestrate the delete comment use case correctly", async () => {
        // Arrange
        const mockThreadRepository = {
            verifyThreadExists: jest.fn().mockResolvedValue(),
        };
        const mockCommentRepository = {
            verifyCommentExists: jest.fn().mockResolvedValue(),
            verifyCommentOwner: jest.fn().mockResolvedValue(),
            deleteCommentById: jest.fn().mockResolvedValue(),
        };

        const useCase = new DeleteCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        const threadId = "thread-123";
        const commentId = "comment-123";
        const owner = "user-123";

        // Action
        await useCase.execute(threadId, commentId, owner);

        // Assert
        expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
            threadId
        );
        expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(
            commentId
        );
        expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
            commentId,
            owner
        );
        expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith(
            commentId
        );
    });
});
