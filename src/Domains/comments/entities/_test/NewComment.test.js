const NewComment = require("../NewComment");

describe("a NewComment entities", () => {
    it("should throw error when payload does not contain needed property", () => {
        // Arrange
        const payload = {
            content: "sebuah komentar",
            threadId: "thread-123",
        };

        // Action and Assert
        expect(() => new NewComment(payload)).toThrowError(
            "NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
        );
    });

    it("should throw error when payload property has incorrect data type", () => {
        // Arrange
        const payload = {
            content: 123,
            threadId: true, 
            owner: {},
        };

        // Action and Assert
        expect(() => new NewComment(payload)).toThrowError(
            "NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
    });

    it("should create NewComment object correctly", () => {
        const payload = {
            content: "komentar valid",
            threadId: "thread-123",
            owner: "user-123",
        };

        // Action
        const newComment = new NewComment(payload);

        // Assert
        expect(newComment.content).toEqual(payload.content);
        expect(newComment.threadId).toEqual(payload.threadId);
        expect(newComment.owner).toEqual(payload.owner);
    });
});
