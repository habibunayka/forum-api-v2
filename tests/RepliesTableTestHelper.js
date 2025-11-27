/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const RepliesTableTestHelper = {
    async addReply({
        id = "reply-123",
        content = "balasan default",
        commentId = "comment-123",
        owner = "user-123",
        date = new Date().toISOString(),
        is_deleted = false,
    }) {
        const query = {
            text: `INSERT INTO replies (id, content, comment_id, user_id, date, is_deleted)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            values: [id, content, commentId, owner, date, is_deleted],
        };

        await pool.query(query);
    },

    async findReplyById(id) {
        const query = {
            text: "SELECT * FROM replies WHERE id = $1",
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async softDeleteReply(id) {
        const query = {
            text: "UPDATE replies SET is_deleted = true WHERE id = $1",
            values: [id],
        };

        await pool.query(query);
    },

    async cleanTable() {
        await pool.query("DELETE FROM replies");
    },
};

module.exports = RepliesTableTestHelper;
