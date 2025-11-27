class ToggleCommentLikeUseCase {
    constructor({ threadRepository, commentRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
    }

    async execute({ threadId, commentId, userId }) {
        await this._threadRepository.verifyThreadExists(threadId);
        await this._commentRepository.verifyCommentExists(commentId);
        await this._commentRepository.verifyCommentInThread(
            commentId,
            threadId
        );

        const isLiked = await this._commentRepository.hasUserLikedComment(
            commentId,
            userId
        );

        if (isLiked) {
            await this._commentRepository.removeCommentLike(commentId, userId);
        } else {
            await this._commentRepository.addCommentLike(commentId, userId);
        }
    }
}

module.exports = ToggleCommentLikeUseCase;
