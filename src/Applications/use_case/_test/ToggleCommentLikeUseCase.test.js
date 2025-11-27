const ToggleCommentLikeUseCase = require("../ToggleCommentLikeUseCase");

describe("ToggleCommentLikeUseCase", () => {
    const threadId = "thread-1";
    const commentId = "comment-1";
    const userId = "user-1";

    const baseDependencies = () => {
        const threadRepository = {
            verifyThreadExists: jest.fn(),
        };
        const commentRepository = {
            verifyCommentExists: jest.fn(),
            verifyCommentInThread: jest.fn(),
            hasUserLikedComment: jest.fn(),
            addCommentLike: jest.fn(),
            removeCommentLike: jest.fn(),
        };
        return { threadRepository, commentRepository };
    };

    it("should add like when user has not liked the comment", async () => {
        const { threadRepository, commentRepository } = baseDependencies();
        commentRepository.hasUserLikedComment.mockResolvedValue(false);

        const useCase = new ToggleCommentLikeUseCase({
            threadRepository,
            commentRepository,
        });

        await useCase.execute({ threadId, commentId, userId });

        expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(
            threadId
        );
        expect(commentRepository.verifyCommentExists).toHaveBeenCalledWith(
            commentId
        );
        expect(commentRepository.verifyCommentInThread).toHaveBeenCalledWith(
            commentId,
            threadId
        );
        expect(commentRepository.hasUserLikedComment).toHaveBeenCalledWith(
            commentId,
            userId
        );
        expect(commentRepository.addCommentLike).toHaveBeenCalledWith(
            commentId,
            userId
        );
        expect(commentRepository.removeCommentLike).not.toHaveBeenCalled();
    });

    it("should remove like when user already liked the comment", async () => {
        const { threadRepository, commentRepository } = baseDependencies();
        commentRepository.hasUserLikedComment.mockResolvedValue(true);

        const useCase = new ToggleCommentLikeUseCase({
            threadRepository,
            commentRepository,
        });

        await useCase.execute({ threadId, commentId, userId });

        expect(commentRepository.removeCommentLike).toHaveBeenCalledWith(
            commentId,
            userId
        );
        expect(commentRepository.addCommentLike).not.toHaveBeenCalled();
    });
});
