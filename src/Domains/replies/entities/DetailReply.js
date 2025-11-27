class DetailReply {
    constructor(payload) {
        this._verifyPayload(payload);
        const { id, comment_id, content, date, username, is_deleted } = payload;

        this.id = id;
        this.comment_id = comment_id;
        this.date = date;
        this.username = username;
        this.content = is_deleted ? "**balasan telah dihapus**" : content;
    }

    _verifyPayload({ id, comment_id, content, date, username, is_deleted }) {
        if (
            !id ||
            !comment_id ||
            !content ||
            !date ||
            !username ||
            is_deleted === undefined
        ) {
            throw new Error("DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
        }
        if (
            typeof id !== "string" ||
            typeof comment_id !== "string" ||
            typeof content !== "string" ||
            typeof date !== "string" ||
            typeof username !== "string" ||
            typeof is_deleted !== "boolean"
        ) {
            throw new Error("DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
        }
    }
}
module.exports = DetailReply;
