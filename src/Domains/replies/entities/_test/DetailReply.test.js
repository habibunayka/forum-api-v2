const DetailReply = require("../DetailReply");

describe("DetailReply entity", () => {
    const now = new Date().toISOString();

    it("should throw error when payload not contain needed property", () => {
        // Arrange
        const payload = {
            id: "reply-123",
            comment_id: "comment-123",
            username: "dicoding",
            date: now,
        };

        // Action and Assert
        expect(() => new DetailReply(payload)).toThrowError(
            "DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
        );
    });

    it("should throw error when payload not meet data type specification", () => {
        // Arrange
        const payload = {
            id: 123,
            comment_id: "comment-123",
            username: [],
            date: now,
            content: {},
            is_deleted: "false",
        };

        // Action and Assert
        expect(() => new DetailReply(payload)).toThrowError(
            "DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
    });

    it("should return masked content when is_deleted is true", () => {
        // Arrange
        const payload = {
            id: "reply-123",
            comment_id: "comment-123",
            username: "dicoding",
            date: now,
            content: "ini isi reply",
            is_deleted: true,
        };

        // Action
        const detailReply = new DetailReply(payload);

        expect(detailReply).toEqual({
            id: "reply-123",
            comment_id: "comment-123",
            username: "dicoding",
            date: now,
            content: "**balasan telah dihapus**",
        });
    });

    it("should create DetailReply object correctly", () => {
        // Arrange
        const payload = {
            id: "reply-123",
            comment_id: "comment-123",
            username: "dicoding",
            date: now,
            content: "ini isi reply",
            is_deleted: false,
        };

        // Action
        const detailReply = new DetailReply(payload);

        // Assert
        expect(detailReply).toEqual({
            id: "reply-123",
            comment_id: "comment-123",
            username: "dicoding",
            date: now,
            content: "ini isi reply",
        });
    });
});
