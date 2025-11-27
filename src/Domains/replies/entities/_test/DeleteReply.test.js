const DeleteReply = require("../DeleteReply");

describe("DeleteReply entity", () => {
    it("should throw error when payload does not contain needed property", () => {
        // Arrange
        const payload = {
            commentId: "comment-123",
            owner: "user-123",
        };

        // Action and Assert
        expect(() => new DeleteReply(payload)).toThrowError(
            "DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
        );
    });

    it("should throw error when payload does not meet data type specification", () => {
        // Arrange
        const payload = {
            commentId: "comment-123",
            replyId: "reply-123",
            owner: true,
        };

        // Action and Assert
        expect(() => new DeleteReply(payload)).toThrowError(
            "DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
    });

    it("should create DeleteReply object correctly", () => {
        // Arrange
        const payload = {
            commentId: "comment-123",
            replyId: "reply-123",
            owner: "user-123",
        };

        // Action
        const deleteReply = new DeleteReply(payload);

        // Assert
        expect(deleteReply.threadId).toEqual(payload.threadId);
        expect(deleteReply.commentId).toEqual(payload.commentId);
        expect(deleteReply.replyId).toEqual(payload.replyId);
        expect(deleteReply.owner).toEqual(payload.owner);
    });
});
