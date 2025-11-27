class CommentRepository {
    async addComment(newComment) {
        throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    }

    async getCommentsByThreadId(threadId) {
        throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    }

    async deleteCommentById(commentId) {
        throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    }

    async verifyCommentExists(commentId) {
        throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    }

    async verifyCommentOwner(commentId, owner) {
        throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    }

    async verifyCommentInThread(commentId, threadId) {
        throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    }

    async hasUserLikedComment(commentId, userId) {
        throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    }

    async addCommentLike(commentId, userId) {
        throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    }

    async removeCommentLike(commentId, userId) {
        throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    }
}

module.exports = CommentRepository;
