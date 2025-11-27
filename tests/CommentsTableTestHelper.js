/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentsTableTestHelper = {
    async addComment({
        id = "comment-123",
        content = "komentar default",
        date = new Date().toISOString(),
        threadId = "thread-123",
        owner = "user-123",
    }) {
        const query = {
            text: "INSERT INTO comments (id, content, date, thread_id, user_id) VALUES ($1, $2, $3, $4, $5)",
            values: [id, content, date, threadId, owner],
        };

        await pool.query(query);
    },

    async findCommentById(id) {
        const query = {
            text: "SELECT * FROM comments WHERE id = $1",
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async isCommentDeleted(id) {
        const query = {
            text: "SELECT is_deleted FROM comments WHERE id = $1",
            values: [id],
        };

        const result = await pool.query(query);
        if (result.rowCount === 0) return null;
        return result.rows[0].is_deleted;
    },

    async softDeleteComment(id) {
        const query = {
            text: "UPDATE comments SET is_deleted = true WHERE id = $1",
            values: [id],
        };
        await pool.query(query);
    },

    async cleanTable() {
        await pool.query("DELETE FROM commentlikes");
        await pool.query("DELETE FROM comments");
    },

    async addLike({
        id = "commentlike-123",
        commentId = "comment-123",
        userId = "user-123",
    }) {
        const query = {
            text: "INSERT INTO commentlikes (id, comment_id, user_id) VALUES ($1, $2, $3)",
            values: [id, commentId, userId],
        };
        await pool.query(query);
    },

    async getLikeCount(commentId) {
        const query = {
            text: "SELECT COUNT(*)::int AS count FROM commentlikes WHERE comment_id = $1",
            values: [commentId],
        };
        const result = await pool.query(query);
        return result.rows[0]?.count ?? 0;
    },
};

module.exports = CommentsTableTestHelper;
