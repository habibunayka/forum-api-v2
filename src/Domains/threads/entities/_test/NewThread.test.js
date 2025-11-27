const NewThread = require("../NewThread");

describe("a NewThread entities", () => {
    it("should throw error when payload not contain needed property", () => {
        // Arrange
        const payload = {
            title: "Judul thread",
        };

        // Action and Assert
        expect(() => new NewThread(payload)).toThrowError(
            "NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
        );
    });

    it("should throw error when payload not meet data type specification", () => {
        // Arrange
        const payload = {
            title: "Judul thread",
            body: "Isi thread",
            owner: 123,
        };

        // Action and Assert
        expect(() => new NewThread(payload)).toThrowError(
            "NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
    });

    it("should create NewThread object correctly", () => {
        // Arrange
        const payload = {
            title: "Judul thread",
            body: "Isi thread",
            owner: "user-123",
        };

        // Action
        const newThread = new NewThread(payload);

        // Assert
        expect(newThread.title).toEqual(payload.title);
        expect(newThread.body).toEqual(payload.body);
        expect(newThread.owner).toEqual(payload.owner);
    });
});
