class DeleteCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(threadId, commentId, owner) {
        await this._threadRepository.verifyThreadExists(threadId);
        await this._commentRepository.verifyCommentExists(commentId);
        await this._commentRepository.verifyCommentOwner(commentId, owner);
        await this._commentRepository.deleteCommentById(commentId);
    }
}

module.exports = DeleteCommentUseCase;
