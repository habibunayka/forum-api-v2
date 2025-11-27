const DeleteComment = require("../DeleteComment");

describe("DeleteComment entity", () => {
    it("should throw error when payload not contain needed property", () => {
        // Arrange
        const payload = { threadId: "thread-123", owner: "user-123" };

        // Action and Assert
        expect(() => new DeleteComment(payload)).toThrowError(
            "DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
        );
    });

    it("should throw error when payload not meet data type specification", () => {
        // Arrange
        const payload = {
            threadId: 123,
            commentId: "comment-123",
            owner: true,
        };

        // Action and Assert
        expect(() => new DeleteComment(payload)).toThrowError(
            "DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
    });

    it("should create DeleteComment entity correctly", () => {
        // Arrange
        const payload = {
            threadId: "thread-123",
            commentId: "comment-123",
            owner: "user-123",
        };

        // Action
        const deleteComment = new DeleteComment(payload);

        // Assert
        expect(deleteComment.threadId).toBe(payload.threadId);
        expect(deleteComment.commentId).toBe(payload.commentId);
        expect(deleteComment.owner).toBe(payload.owner);
    });
});
