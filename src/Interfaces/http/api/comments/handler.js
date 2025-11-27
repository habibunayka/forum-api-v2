const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");

class CommentsHandler {
    constructor(container) {
        this._container = container;
        this.postCommentHandler = this.postCommentHandler.bind(this);
        this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
        this.toggleLikeHandler = this.toggleLikeHandler.bind(this);
    }

    async postCommentHandler(request, h) {
        const { id: owner } = request.auth.credentials;
        const { threadId } = request.params;
        const { content } = request.payload;

        const addCommentUseCase = this._container.getInstance(
            AddCommentUseCase.name
        );

        const addedComment = await addCommentUseCase.execute(
            { content },
            threadId,
            owner
        );

        const response = h.response({
            status: "success",
            data: {
                addedComment,
            },
        });
        response.code(201);
        return response;
    }

    async deleteCommentHandler(request, h) {
        const { threadId, commentId } = request.params;
        const { id: owner } = request.auth.credentials;

        const deleteCommentUseCase = this._container.getInstance(
            "DeleteCommentUseCase"
        );

        await deleteCommentUseCase.execute(threadId, commentId, owner);

        return {
            status: "success",
        };
    }

    async toggleLikeHandler(request, h) {
        const { threadId, commentId } = request.params;
        const { id: userId } = request.auth.credentials;

        const toggleCommentLikeUseCase = this._container.getInstance(
            "ToggleCommentLikeUseCase"
        );

        await toggleCommentLikeUseCase.execute({ threadId, commentId, userId });

        return {
            status: "success",
        };
    }
}

module.exports = CommentsHandler;
