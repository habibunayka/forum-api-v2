const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");

describe("ReplyRepositoryPostgres", () => {
    const now = new Date("2025-07-12T00:00:00.000Z").toISOString();

    beforeEach(async () => {
        await UsersTableTestHelper.addUser({
            id: "user-123",
            username: "user-123",
        });
        await ThreadsTableTestHelper.addThread({
            id: "thread-123",
            title: "judul",
            body: "isi",
            owner: "user-123",
        });
        await CommentsTableTestHelper.addComment({
            id: "comment-123",
            content: "komentar",
            owner: "user-123",
            date: now,
        });
    });

    afterEach(async () => {
        await RepliesTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe("addReply function", () => {
        it("should persist reply and return added reply correctly", async () => {
            const newReply = new NewReply({
                content: "sebuah balasan",
                commentId: "comment-123",
                owner: "user-123",
            });
            const fakeIdGenerator = () => "456";
            const replyRepository = new ReplyRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            const addedReply = await replyRepository.addReply(newReply);

            expect(addedReply).toStrictEqual(
                new AddedReply({
                    id: "reply-456",
                    content: "sebuah balasan",
                    owner: "user-123",
                })
            );

            const replies =
                await RepliesTableTestHelper.findReplyById("reply-456");
            expect(replies).toHaveLength(1);
            expect(replies[0].content).toBe("sebuah balasan");
        });
    });

    describe("deleteReplyById function", () => {
        it("should soft delete the reply by setting is_deleted to true", async () => {
            await RepliesTableTestHelper.addReply({
                id: "reply-789",
                content: "reply to be deleted",
                commentId: "comment-123",
                owner: "user-123",
                date: now,
            });
            const replyRepository = new ReplyRepositoryPostgres(pool, () => "");

            await replyRepository.deleteReplyById("reply-789");

            const replies =
                await RepliesTableTestHelper.findReplyById("reply-789");
            expect(replies[0].is_deleted).toBe(true);
        });
    });

    describe("verifyReplyExists function", () => {
        it("should throw error if reply not found", async () => {
            const replyRepository = new ReplyRepositoryPostgres(pool, () => "");
            await expect(
                replyRepository.verifyReplyExists("not-exist")
            ).rejects.toThrow("REPLY_REPOSITORY.NOT_FOUND");
        });

        it("should not throw error if reply exists", async () => {
            await RepliesTableTestHelper.addReply({
                id: "reply-001",
                commentId: "comment-123",
                owner: "user-123",
                date: now,
            });
            const replyRepository = new ReplyRepositoryPostgres(pool, () => "");
            await expect(
                replyRepository.verifyReplyExists("reply-001")
            ).resolves.not.toThrow("REPLY_REPOSITORY.NOT_FOUND");
        });
    });

    describe("verifyReplyOwner function", () => {
        it("should throw error if not owner", async () => {
            await RepliesTableTestHelper.addReply({
                id: "reply-002",
                commentId: "comment-123",
                owner: "user-123",
                date: now,
            });
            const replyRepository = new ReplyRepositoryPostgres(pool, () => "");
            await expect(
                replyRepository.verifyReplyOwner("reply-002", "user-456")
            ).rejects.toThrow("REPLY_REPOSITORY.UNAUTHORIZED");
        });

        it("should not throw error if owner matches", async () => {
            await RepliesTableTestHelper.addReply({
                id: "reply-003",
                commentId: "comment-123",
                owner: "user-123",
                date: now,
            });
            const replyRepository = new ReplyRepositoryPostgres(pool, () => "");
            await expect(
                replyRepository.verifyReplyOwner("reply-003", "user-123")
            ).resolves.not.toThrow("REPLY_REPOSITORY.UNAUTHORIZED");
        });
    });

    describe("getRepliesByCommentId function", () => {
        it("should return replies grouped by comment id and ordered by date ASC", async () => {
            const reply1Date = new Date("2021-01-01T00:00:00.000Z");
            const reply2Date = new Date("2021-01-02T00:00:00.000Z");

            await RepliesTableTestHelper.addReply({
                id: "reply-a",
                commentId: "comment-123",
                owner: "user-123",
                content: "balasan pertama",
                date: reply1Date.toISOString(),
                is_deleted: false,
            });

            await RepliesTableTestHelper.addReply({
                id: "reply-b",
                commentId: "comment-123",
                owner: "user-123",
                content: "balasan kedua (dihapus)",
                date: reply2Date.toISOString(),
                is_deleted: true,
            });

            const replyRepository = new ReplyRepositoryPostgres(pool, () => "");

            const replies = await replyRepository.getRepliesByCommentId([
                "comment-123",
            ]);

            expect(replies).toHaveLength(2);

            // Assert
            expect(replies[0].id).toBe("reply-a");
            expect(replies[0].comment_id).toBe("comment-123");
            expect(replies[0].username).toBe("user-123");
            expect(new Date(replies[0].date).toISOString()).toBe(
                reply1Date.toISOString()
            );
            expect(replies[0].content).toBe("balasan pertama");
            expect(replies[0].is_deleted).toBe(false);

            expect(replies[1].id).toBe("reply-b");
            expect(replies[1].comment_id).toBe("comment-123");
            expect(replies[1].username).toBe("user-123");
            expect(new Date(replies[1].date).toISOString()).toBe(
                reply2Date.toISOString()
            );
            expect(replies[1].content).toBe("balasan kedua (dihapus)");
            expect(replies[1].is_deleted).toBe(true);
        });
    });

    describe("getRepliesByThreadId function", () => {
        beforeEach(async () => {
            await RepliesTableTestHelper.addReply({
                id: "reply-10",
                commentId: "comment-123",
                content: "balasan 1",
                owner: "user-123",
                date: "2021-01-02T00:00:00.000Z",
                is_deleted: false,
            });

            await RepliesTableTestHelper.addReply({
                id: "reply-11",
                commentId: "comment-123",
                content: "balasan 2",
                owner: "user-123",
                date: "2021-01-03T00:00:00.000Z",
                is_deleted: true,
            });

            await CommentsTableTestHelper.addComment({
                id: "comment-222",
                threadId: "thread-123",
                owner: "user-123",
            });

            await RepliesTableTestHelper.addReply({
                id: "reply-20",
                commentId: "comment-222",
                content: "balasan 3",
                owner: "user-123",
                date: "2021-01-04T00:00:00.000Z",
                is_deleted: false,
            });
        });

        it("should return all replies associated with the thread, ordered by date", async () => {
            const replyRepository = new ReplyRepositoryPostgres(pool);

            const replies =
                await replyRepository.getRepliesByThreadId("thread-123");

            expect(replies).toHaveLength(3);

            expect(replies[0]).toMatchObject({
                id: "reply-10",
                content: "balasan 1",
                comment_id: "comment-123",
                username: "user-123",
                is_deleted: false,
            });
            expect(new Date(replies[0].date).toISOString()).toBe(
                "2021-01-02T00:00:00.000Z"
            );

            expect(replies[1]).toMatchObject({
                id: "reply-11",
                content: "balasan 2",
                comment_id: "comment-123",
                username: "user-123",
                is_deleted: true,
            });
            expect(new Date(replies[1].date).toISOString()).toBe(
                "2021-01-03T00:00:00.000Z"
            );

            expect(replies[2]).toMatchObject({
                id: "reply-20",
                content: "balasan 3",
                comment_id: "comment-222",
                username: "user-123",
                is_deleted: false,
            });
            expect(new Date(replies[2].date).toISOString()).toBe(
                "2021-01-04T00:00:00.000Z"
            );

            const dates = replies.map((r) => new Date(r.date).getTime());
            const sortedDates = [...dates].sort((a, b) => a - b);
            expect(dates).toEqual(sortedDates);
        });
    });
});
