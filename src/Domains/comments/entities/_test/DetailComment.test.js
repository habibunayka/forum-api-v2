const DetailComment = require("../DetailComment");

describe("DetailComment entity", () => {
    it("should mask content when is_deleted is true", () => {
        // Arrange
        const payload = {
            id: "comment-123",
            username: "dicoding",
            date: "2025-07-12",
            content: "Komentar asli",
            is_deleted: true,
            replies: [],
            likeCount: 5,
        };

        // Action
        const detailComment = new DetailComment(payload);

        // Assert
        expect(detailComment).toEqual({
            id: "comment-123",
            username: "dicoding",
            date: "2025-07-12",
            content: "**komentar telah dihapus**",
            replies: [],
            likeCount: 5,
        });
    });

    it("should keep original content when is_deleted is false", () => {
        // Arrange
        const payload = {
            id: "comment-124",
            username: "dicoding",
            date: "2025-07-12",
            content: "Komentar asli",
            is_deleted: false,
            replies: [],
            likeCount: 0,
        };

        // Action
        const detailComment = new DetailComment(payload);

        // Assert
        expect(detailComment).toEqual({
            id: "comment-124",
            username: "dicoding",
            date: "2025-07-12",
            content: "Komentar asli",
            replies: [],
            likeCount: 0,
        });
    });

    it("should throw error when required property is missing", () => {
        // Arrange
        const payload = {
            id: "comment-125",
            username: "dicoding",
            date: "2025-07-12",
            is_deleted: false,
        };

        // Assert
        expect(() => new DetailComment(payload)).toThrowError(
            "DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
        );
    });

    it("should throw error when data types are not correct", () => {
        // Arrange
        const payload = {
            id: 123,
            username: "dicoding",
            date: "2025-07-12",
            content: "Komentar",
            is_deleted: "false",
        };

        // Assert
        expect(() => new DetailComment(payload)).toThrowError(
            "DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
    });

    it("should assign empty array to replies when replies is undefined", () => {
        // Arrange
        const payload = {
            id: "comment-126",
            username: "dicoding",
            date: "2025-07-12",
            content: "Komentar",
            is_deleted: false,
            likeCount: 2,
        };

        // Action
        const detailComment = new DetailComment(payload);

        // Assert
        expect(detailComment.replies).toEqual([]);
        expect(detailComment.likeCount).toBe(2);
    });
});
