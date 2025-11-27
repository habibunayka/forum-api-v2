const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");

const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");

describe("CommentRepositoryPostgres", () => {
    beforeEach(async () => {
        await UsersTableTestHelper.addUser({ id: "user-123" });
        await ThreadsTableTestHelper.addThread({
            id: "thread-123",
            title: "judul",
            body: "isi",
            owner: "user-123",
        });
    });

    afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe("addComment function", () => {
        it("should persist comment and return added comment correctly", async () => {
            // Arrange
            const newComment = new NewComment({
                content: "komentar keren",
                threadId: "thread-123",
                owner: "user-123",
            });
            const fakeIdGenerator = () => "456";
            const commentRepository = new CommentRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            // Action
            const addedComment = await commentRepository.addComment(newComment);

            // Assert
            expect(addedComment).toStrictEqual(
                new AddedComment({
                    id: "comment-456",
                    content: "komentar keren",
                    owner: "user-123",
                })
            );

            const comments =
                await CommentsTableTestHelper.findCommentById("comment-456");
            expect(comments).toHaveLength(1);
            expect(comments[0].content).toBe("komentar keren");
        });
    });

    describe("getCommentsByThreadId function", () => {
        it("should return all comments from the thread in ascending order with correct is_deleted flags and like counts", async () => {
            // Arrange
            const date1 = new Date("2025-07-09T08:00:00Z").toISOString();
            const date2 = new Date("2025-07-09T09:00:00Z").toISOString();

            await CommentsTableTestHelper.addComment({
                id: "comment-1",
                content: "komentar pertama",
                date: date1,
                threadId: "thread-123",
                owner: "user-123",
            });

            await CommentsTableTestHelper.addComment({
                id: "comment-2",
                content: "komentar kedua",
                date: date2,
                threadId: "thread-123",
                owner: "user-123",
            });

            await CommentsTableTestHelper.softDeleteComment("comment-2");

            await CommentsTableTestHelper.addLike({
                id: "commentlike-1",
                commentId: "comment-1",
                userId: "user-123",
            });

            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "irrelevant"
            );

            // Action
            const comments =
                await commentRepository.getCommentsByThreadId("thread-123");

            // Assert
            expect(comments).toHaveLength(2);

            expect(comments[0]).toEqual(
                expect.objectContaining({
                    id: "comment-1",
                    content: "komentar pertama",
                    is_deleted: false,
                    username: "dicoding",
                    like_count: 1,
                })
            );
            expect(comments[0].date.toISOString()).toBe(date1);

            expect(comments[1]).toEqual(
                expect.objectContaining({
                    id: "comment-2",
                    content: "komentar kedua",
                    is_deleted: true,
                    username: "dicoding",
                    like_count: 0,
                })
            );
            expect(comments[1].date.toISOString()).toBe(date2);
        });
    });

    describe("verifyCommentExists function", () => {
        it("should not throw error when comment exists", async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({
                id: "comment-xyz",
                content: "komentar exist",
                threadId: "thread-123",
                owner: "user-123",
            });
            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "irrelevant"
            );

            // Action and Assert
            await expect(
                commentRepository.verifyCommentExists("comment-xyz")
            ).resolves.not.toThrow("REPLY_REPOSITORY.NOT_FOUND");
        });

        it("should throw NotFoundError when comment does not exist", async () => {
            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "irrelevant"
            );

            // Action and Assert
            await expect(
                commentRepository.verifyCommentExists("comment-notfound")
            ).rejects.toThrowError("Komentar tidak ditemukan");
        });
    });

    describe("verifyCommentOwner function", () => {
        it("should not throw error when user is the owner", async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({
                id: "comment-owner",
                content: "komentar",
                threadId: "thread-123",
                owner: "user-123",
            });

            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "irrelevant"
            );

            // Action and Assert
            await expect(
                commentRepository.verifyCommentOwner(
                    "comment-owner",
                    "user-123"
                )
            ).resolves.not.toThrow("COMMENT_REPOSITORY.UNAUTHORIZED");
        });

        it("should throw AuthorizationError when user is not the owner", async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({
                id: "comment-wrong-owner",
                content: "komentar",
                threadId: "thread-123",
                owner: "user-123",
            });

            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "irrelevant"
            );

            // Action and Assert
            await expect(
                commentRepository.verifyCommentOwner(
                    "comment-wrong-owner",
                    "user-456"
                )
            ).rejects.toThrowError("Anda tidak berhak mengakses resource ini");
        });

        it("should throw NotFoundError when comment not found", async () => {
            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "irrelevant"
            );

            await expect(
                commentRepository.verifyCommentOwner("comment-x", "user-123")
            ).rejects.toThrowError("Komentar tidak ditemukan");
        });
    });

    describe("deleteCommentById function", () => {
        it("should soft delete the comment by setting is_deleted to true", async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({
                id: "comment-999",
                content: "komentar yang akan dihapus",
                threadId: "thread-123",
                owner: "user-123",
            });

            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "irrelevant"
            );

            // Action
            await commentRepository.deleteCommentById("comment-999");

            // Assert
            const is_deleted =
                await CommentsTableTestHelper.isCommentDeleted("comment-999");
            expect(is_deleted).toBe(true);
        });
    });

    describe("verifyCommentInThread function", () => {
        it("should resolve when comment belongs to the thread", async () => {
            await CommentsTableTestHelper.addComment({
                id: "comment-in-thread",
                threadId: "thread-123",
                owner: "user-123",
            });

            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "irrelevant"
            );

            await expect(
                commentRepository.verifyCommentInThread(
                    "comment-in-thread",
                    "thread-123"
                )
            ).resolves.not.toThrow();
        });

        it("should throw when comment does not belong to the thread", async () => {
            await ThreadsTableTestHelper.addThread({
                id: "thread-999",
                owner: "user-123",
            });
            await CommentsTableTestHelper.addComment({
                id: "comment-other",
                threadId: "thread-999",
                owner: "user-123",
            });

            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "irrelevant"
            );

            await expect(
                commentRepository.verifyCommentInThread(
                    "comment-other",
                    "thread-123"
                )
            ).rejects.toThrow("Komentar tidak ditemukan di thread ini");
        });
    });

    describe("like management", () => {
        it("should return true when user has liked comment and false otherwise", async () => {
            await CommentsTableTestHelper.addComment({
                id: "comment-like",
                threadId: "thread-123",
                owner: "user-123",
            });
            await CommentsTableTestHelper.addLike({
                id: "commentlike-like",
                commentId: "comment-like",
                userId: "user-123",
            });

            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "id"
            );

            await expect(
                commentRepository.hasUserLikedComment(
                    "comment-like",
                    "user-123"
                )
            ).resolves.toBe(true);
            await expect(
                commentRepository.hasUserLikedComment(
                    "comment-like",
                    "user-000"
                )
            ).resolves.toBe(false);
        });

        it("should add and remove likes correctly", async () => {
            await CommentsTableTestHelper.addComment({
                id: "comment-like-2",
                threadId: "thread-123",
                owner: "user-123",
            });
            await UsersTableTestHelper.addUser({
                id: "user-456",
                username: "second",
            });

            const commentRepository = new CommentRepositoryPostgres(
                pool,
                () => "idlike"
            );

            await commentRepository.addCommentLike(
                "comment-like-2",
                "user-123"
            );
            await commentRepository.addCommentLike(
                "comment-like-2",
                "user-456"
            );

            let likeCount = await CommentsTableTestHelper.getLikeCount(
                "comment-like-2"
            );
            expect(likeCount).toBe(2);

            await commentRepository.removeCommentLike(
                "comment-like-2",
                "user-123"
            );
            likeCount = await CommentsTableTestHelper.getLikeCount(
                "comment-like-2"
            );
            expect(likeCount).toBe(1);
        });
    });
});
