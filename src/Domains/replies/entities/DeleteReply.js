class DeleteReply {
    constructor(payload) {
        this._verifyPayload(payload);

        const { commentId, replyId, owner } = payload;

        this.commentId = commentId;
        this.replyId = replyId;
        this.owner = owner;
    }

    _verifyPayload({ commentId, replyId, owner }) {
        if (!commentId || !replyId || !owner) {
            throw new Error("DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
        }

        if (
            typeof commentId !== "string" ||
            typeof replyId !== "string" ||
            typeof owner !== "string"
        ) {
            throw new Error("DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
        }
    }
}

module.exports = DeleteReply;
