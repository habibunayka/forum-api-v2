const AddedComment = require("../AddedComment");

describe("a AddedComment entities", () => {
    it("should throw error when payload does not contain needed property", () => {
        // Arrange
        const payload = {
            id: "comment-123",
            content: "komentar",
        };

        // Action and Assert
        expect(() => new AddedComment(payload)).toThrowError(
            "ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
        );
    });

    it("should throw error when payload property has incorrect data type", () => {
        // Arrange
        const payload = {
            id: 123,
            content: [],
            owner: {},
        };

        // Action and Assert
        expect(() => new AddedComment(payload)).toThrowError(
            "ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
    });

    it("should create AddedComment object correctly", () => {
        // Arrange
        const payload = {
            id: "comment-123",
            content: "komentar ditambahkan",
            owner: "user-123",
        };

        // Action
        const addedComment = new AddedComment(payload);

        // Assert
        expect(addedComment.id).toEqual(payload.id);
        expect(addedComment.content).toEqual(payload.content);
        expect(addedComment.owner).toEqual(payload.owner);
    });
});
