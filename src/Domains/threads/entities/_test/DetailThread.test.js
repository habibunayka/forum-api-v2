const DetailThread = require("../DetailThread");
const DetailComment = require("../../../comments/entities/DetailComment");

describe("a DetailThread entities", () => {
    const now = new Date().toISOString();

    it("should create DetailThread object correctly", () => {
        // Arrange
        const payload = {
            id: "thread-123",
            title: "Sebuah Judul",
            body: "Isi thread",
            date: now,
            username: "dicoding",
            comments: [
                new DetailComment({
                    id: "comment-123",
                    username: "dicoding2",
                    date: now,
                    content: "Komentar pertama",
                    is_deleted: false,
                    replies: [],
                    likeCount: 1,
                }),
                new DetailComment({
                    id: "comment-456",
                    username: "dicoding",
                    date: now,
                    content: "Komentar kedua",
                    is_deleted: true,
                    replies: [],
                    likeCount: 0,
                }),
            ],
        };

        // Action
        const thread = new DetailThread(payload);

        // Assert
        expect(thread.id).toBe(payload.id);
        expect(thread.title).toBe(payload.title);
        expect(thread.body).toBe(payload.body);
        expect(thread.date).toBe(payload.date);
        expect(thread.username).toBe(payload.username);
        expect(thread.comments).toEqual(payload.comments);
        expect(thread.comments[1].content).toBe("**komentar telah dihapus**");
    });

    it("should throw error when payload is missing properties", () => {
        // Arrange
        const payload = {
            id: "thread-123",
            title: "Sebuah Judul",
            body: "Isi thread",
            username: "dicoding",
            comments: [],
        };

        // Action and Assert
        expect(() => new DetailThread(payload)).toThrowError(
            "DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
        );
    });

    it("should throw error when payload has invalid data types", () => {
        // Arrange
        const payload = {
            id: "thread-123",
            title: "Sebuah Judul",
            body: "Isi thread",
            date: now,
            username: 123, 
            comments: "not-an-array", 
        };

        // Action and Assert
        expect(() => new DetailThread(payload)).toThrowError(
            "DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
    });
});
