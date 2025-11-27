const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class CommentRepositoryPostgres extends CommentRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addComment(newComment) {
        const { content, threadId, owner } = newComment;
        const id = `comment-${this._idGenerator()}`;
        const date = new Date().toISOString();

        const query = {
            text: "INSERT INTO comments (id, content, date, thread_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, content, user_id AS owner",
            values: [id, content, date, threadId, owner],
        };

        const result = await this._pool.query(query);
        return new AddedComment(result.rows[0]);
    }

    async getCommentsByThreadId(threadId) {
        const query = {
            text: `
                SELECT comments.id,
                       users.username,
                       comments.date,
                       comments.content,
                       comments.is_deleted,
                       COALESCE(like_counts.like_count, 0) AS like_count
                FROM comments
                JOIN users ON comments.user_id = users.id
                LEFT JOIN (
                    SELECT comment_id, COUNT(*)::int AS like_count
                    FROM commentlikes
                    GROUP BY comment_id
                ) AS like_counts ON like_counts.comment_id = comments.id
                WHERE comments.thread_id = $1
                ORDER BY comments.date ASC
            `,
            values: [threadId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async verifyCommentExists(commentId) {
        const query = {
            text: "SELECT id FROM comments WHERE id = $1",
            values: [commentId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError("Komentar tidak ditemukan");
        }
    }

    async verifyCommentOwner(commentId, ownerId) {
        const query = {
            text: "SELECT user_id FROM comments WHERE id = $1",
            values: [commentId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError("Komentar tidak ditemukan");
        }

        if (result.rows[0].user_id !== ownerId) {
            throw new AuthorizationError(
                "Anda tidak berhak mengakses resource ini"
            );
        }
    }

    async deleteCommentById(commentId) {
        const query = {
            text: "UPDATE comments SET is_deleted = true WHERE id = $1",
            values: [commentId],
        };

        await this._pool.query(query);
    }

    async verifyCommentInThread(commentId, threadId) {
        const query = {
            text: "SELECT 1 FROM comments WHERE id = $1 AND thread_id = $2",
            values: [commentId, threadId],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError("Komentar tidak ditemukan di thread ini");
        }
    }

    async hasUserLikedComment(commentId, userId) {
        const query = {
            text: "SELECT 1 FROM commentlikes WHERE comment_id = $1 AND user_id = $2",
            values: [commentId, userId],
        };

        const result = await this._pool.query(query);
        return Boolean(result.rowCount);
    }

    async addCommentLike(commentId, userId) {
        const id = `commentlike-${this._idGenerator()}-${commentId}-${userId}`;
        const query = {
            text: "INSERT INTO commentlikes (id, comment_id, user_id) VALUES ($1, $2, $3)",
            values: [id, commentId, userId],
        };
        await this._pool.query(query);
    }

    async removeCommentLike(commentId, userId) {
        const query = {
            text: "DELETE FROM commentlikes WHERE comment_id = $1 AND user_id = $2",
            values: [commentId, userId],
        };
        await this._pool.query(query);
    }
}

module.exports = CommentRepositoryPostgres;
