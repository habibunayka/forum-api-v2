class DetailComment {
    constructor(payload) {
        this._verifyPayload(payload);

        const {
            id,
            username,
            date,
            content,
            is_deleted,
            replies,
            likeCount = 0,
        } = payload;

        this.id = id;
        this.username = username;
        this.date = date;
        this.content = is_deleted ? "**komentar telah dihapus**" : content;
        this.replies = replies || [];
        this.likeCount = likeCount;
    }

    _verifyPayload({ id, username, date, content, is_deleted, likeCount }) {
        if (
            !id ||
            !username ||
            !date ||
            content === undefined ||
            is_deleted === undefined
        ) {
            throw new Error("DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
        }

        if (
            typeof id !== "string" ||
            typeof username !== "string" ||
            typeof date !== "string" ||
            typeof content !== "string" ||
            typeof is_deleted !== "boolean" ||
            (likeCount !== undefined && typeof likeCount !== "number")
        ) {
            throw new Error("DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
        }
    }
}

module.exports = DetailComment;
