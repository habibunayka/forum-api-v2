const CommentRepository = require("../CommentRepository");

describe("CommentRepository interface", () => {
    it("should throw error when calling unimplemented addComment", async () => {
        const commentRepository = new CommentRepository();
        await expect(commentRepository.addComment({})).rejects.toThrowError(
            "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
        );
    });

    it("should throw error when calling unimplemented getCommentsByThreadId", async () => {
        const commentRepository = new CommentRepository();
        await expect(
            commentRepository.getCommentsByThreadId("thread-123")
        ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when calling unimplemented deleteCommentById", async () => {
        const commentRepository = new CommentRepository();
        await expect(
            commentRepository.deleteCommentById("comment-123")
        ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when calling unimplemented verifyCommentExists", async () => {
        const commentRepository = new CommentRepository();
        await expect(
            commentRepository.verifyCommentExists("comment-123")
        ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when calling unimplemented verifyCommentOwner", async () => {
        const commentRepository = new CommentRepository();
        await expect(
            commentRepository.verifyCommentOwner("comment-123", "user-123")
        ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when calling unimplemented verifyCommentInThread", async () => {
        const commentRepository = new CommentRepository();
        await expect(
            commentRepository.verifyCommentInThread("comment-123", "thread-123")
        ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when calling unimplemented hasUserLikedComment", async () => {
        const commentRepository = new CommentRepository();
        await expect(
            commentRepository.hasUserLikedComment("comment-123", "user-123")
        ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when calling unimplemented addCommentLike", async () => {
        const commentRepository = new CommentRepository();
        await expect(
            commentRepository.addCommentLike("comment-123", "user-123")
        ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when calling unimplemented removeCommentLike", async () => {
        const commentRepository = new CommentRepository();
        await expect(
            commentRepository.removeCommentLike("comment-123", "user-123")
        ).rejects.toThrowError("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });
});
