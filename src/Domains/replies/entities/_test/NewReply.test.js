const NewReply = require("../NewReply");

describe("NewReply entity", () => {
    it("should throw error when payload not contain needed property", () => {
        const payload = {
            content: "sebuah balasan",
        };

        expect(() => new NewReply(payload)).toThrowError(
            "NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
        );
    });

    it("should throw error when payload not meet data type specification", () => {
        const payload = {
            content: 123,
            commentId: true,
            owner: {},
        };

        expect(() => new NewReply(payload)).toThrowError(
            "NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
    });

    it("should create NewReply object correctly", () => {
        const payload = {
            content: "sebuah balasan",
            commentId: "comment-123",
            owner: "user-123",
        };

        const newReply = new NewReply(payload);

        expect(newReply.content).toEqual(payload.content);
        expect(newReply.commentId).toEqual(payload.commentId);
        expect(newReply.owner).toEqual(payload.owner);
    });
});
