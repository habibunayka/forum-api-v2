const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const AddedReply = require("../../Domains/replies/entities/AddedReply");

class ReplyRepositoryPostgres extends ReplyRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addReply(newReply) {
        const { content, commentId, owner } = newReply;
        const id = `reply-${this._idGenerator()}`;
        const date = new Date().toISOString();

        const query = {
            text: `
                INSERT INTO replies (id, content, comment_id, user_id, date)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, content, user_id AS owner
            `,
            values: [id, content, commentId, owner, date],
        };

        const result = await this._pool.query(query);
        return new AddedReply({
            id: result.rows[0].id,
            content: result.rows[0].content,
            owner: result.rows[0].owner,
        });
    }

    async deleteReplyById(replyId) {
        const query = {
            text: `UPDATE replies SET is_deleted = true WHERE id = $1`,
            values: [replyId],
        };
        await this._pool.query(query);
    }

    async verifyReplyOwner(replyId, owner) {
        const query = {
            text: `SELECT id FROM replies WHERE id = $1 AND user_id = $2`,
            values: [replyId, owner],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new Error("REPLY_REPOSITORY.UNAUTHORIZED");
        }
    }

    async verifyReplyExists(replyId) {
        const query = {
            text: `SELECT id FROM replies WHERE id = $1`,
            values: [replyId],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new Error("REPLY_REPOSITORY.NOT_FOUND");
        }
    }

    async getRepliesByCommentId(commentIds) {
        const query = {
            text: `
                SELECT replies.id, replies.content, replies.date, replies.comment_id,
                       replies.is_deleted, users.username
                FROM replies
                LEFT JOIN users ON users.id = replies.user_id
                WHERE replies.comment_id = ANY($1::text[])
                ORDER BY replies.date ASC
            `,
            values: [commentIds],
        };
        const result = await this._pool.query(query);
        return result.rows;
    }

    async getRepliesByThreadId(threadId) {
        const query = {
            text: `
                SELECT replies.id, replies.comment_id, replies.content, replies.date, replies.is_deleted, users.username
                FROM replies
                JOIN comments ON comments.id = replies.comment_id
                JOIN users ON users.id = replies.user_id
                WHERE comments.thread_id = $1
                ORDER BY replies.date ASC
            `,
            values: [threadId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }
}

module.exports = ReplyRepositoryPostgres;
