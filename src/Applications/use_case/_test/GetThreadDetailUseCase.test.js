const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const DetailComment = require("../../../Domains/comments/entities/DetailComment");
const DetailReply = require("../../../Domains/replies/entities/DetailReply");

describe("GetThreadDetailUseCase", () => {
    it("should orchestrate the get thread detail use case correctly", async () => {
        const threadId = "thread-123";
        const now = new Date().toISOString();

        const mockThreadRepository = {
            getThreadById: jest.fn().mockResolvedValue({
                id: "thread-123",
                title: "Judul Thread",
                body: "Isi thread",
                date: now,
                username: "dicoding",
            }),
        };

        const mockCommentRepository = {
            getCommentsByThreadId: jest.fn().mockResolvedValue([
                {
                    id: "comment-123",
                    username: "johndoe",
                    date: now,
                    content: "sebuah comment",
                    is_deleted: false,
                    like_count: 2,
                },
                {
                    id: "comment-456",
                    username: "dicoding",
                    date: now,
                    content: "komentar apapun",
                    is_deleted: true,
                    like_count: 0,
                },
            ]),
        };

        const mockReplyRepository = {
            getRepliesByThreadId: jest.fn().mockResolvedValue([
                {
                    id: "reply-001",
                    comment_id: "comment-123",
                    content: "ini balasan",
                    date: now,
                    username: "alice",
                    is_deleted: false,
                },
                {
                    id: "reply-002",
                    comment_id: "comment-456",
                    content: "balasan yg dihapus",
                    date: now,
                    username: "bob",
                    is_deleted: true,
                },
            ]),
        };

        const useCase = new GetThreadDetailUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        const detailThread = await useCase.execute(threadId);

        // Assert
        expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
        expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
            threadId
        );
        expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(
            threadId
        );

        expect(detailThread).toMatchObject({
            id: "thread-123",
            title: "Judul Thread",
            body: "Isi thread",
            date: now,
            username: "dicoding",
        });

        expect(detailThread.comments).toHaveLength(2);

        expect(detailThread.comments[0]).toStrictEqual(
            new DetailComment({
                id: "comment-123",
                content: "sebuah comment",
                username: "johndoe",
                date: now,
                is_deleted: false,
                likeCount: 2,
                replies: [
                    new DetailReply({
                        id: "reply-001",
                        comment_id: "comment-123",
                        content: "ini balasan",
                        date: now,
                        username: "alice",
                        is_deleted: false,
                    }),
                ],
            })
        );

        expect(detailThread.comments[1]).toStrictEqual(
            new DetailComment({
                id: "comment-456",
                content: "**komentar telah dihapus**",
                username: "dicoding",
                date: now,
                is_deleted: true,
                likeCount: 0,
                replies: [
                    new DetailReply({
                        id: "reply-002",
                        comment_id: "comment-456",
                        content: "**balasan telah dihapus**",
                        date: now,
                        username: "bob",
                        is_deleted: true,
                    }),
                ],
            })
        );
    });

    it("should convert dates to ISO string when date is a Date object", async () => {
        const threadId = "thread-123";
        const dateObj = new Date("2025-07-12T09:00:00.000Z");

        const mockThreadRepository = {
            getThreadById: jest.fn().mockResolvedValue({
                id: threadId,
                title: "Judul Thread",
                body: "Isi thread",
                date: dateObj,
                username: "dicoding",
            }),
        };

        const mockCommentRepository = {
            getCommentsByThreadId: jest.fn().mockResolvedValue([
                {
                    id: "comment-123",
                    username: "johndoe",
                    date: dateObj,
                    content: "komentar",
                    is_deleted: false,
                    like_count: 3,
                },
            ]),
        };

        const mockReplyRepository = {
            getRepliesByThreadId: jest.fn().mockResolvedValue([
                {
                    id: "reply-001",
                    comment_id: "comment-123",
                    content: "ini reply",
                    date: dateObj,
                    username: "alice",
                    is_deleted: false,
                },
            ]),
        };

        const useCase = new GetThreadDetailUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        const result = await useCase.execute(threadId);
        const isoString = dateObj.toISOString();

        expect(result.date).toBe(isoString);
        expect(result.comments[0].date).toBe(isoString);
        expect(result.comments[0].replies[0].date).toBe(isoString);
    });

    it("should return thread detail with empty comments when no comments found", async () => {
        const threadId = "thread-123";
        const now = new Date().toISOString();

        const mockThreadRepository = {
            getThreadById: jest.fn().mockResolvedValue({
                id: threadId,
                title: "Thread Kosong",
                body: "Tidak ada komentar",
                date: now,
                username: "tester",
            }),
        };

        const mockCommentRepository = {
            getCommentsByThreadId: jest.fn().mockResolvedValue([]),
        };

        const mockReplyRepository = {
            getRepliesByThreadId: jest.fn().mockResolvedValue([]),
        };

        const useCase = new GetThreadDetailUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        const result = await useCase.execute(threadId);

        expect(result.id).toBe(threadId);
        expect(result.comments).toEqual([]);
    });

    it("should ignore replies that don't match any comment_id", async () => {
        const threadId = "thread-123";
        const now = new Date().toISOString();

        const mockThreadRepository = {
            getThreadById: jest.fn().mockResolvedValue({
                id: threadId,
                title: "Thread Test",
                body: "Isi",
                date: now,
                username: "tester",
            }),
        };

        const mockCommentRepository = {
            getCommentsByThreadId: jest.fn().mockResolvedValue([
                {
                    id: "comment-123",
                    username: "user1",
                    date: now,
                    content: "komentar",
                    is_deleted: false,
                    like_count: 1,
                },
            ]),
        };

        const mockReplyRepository = {
            getRepliesByThreadId: jest.fn().mockResolvedValue([
                {
                    id: "reply-999",
                    comment_id: "nonexistent-comment",
                    content: "should not be included",
                    date: now,
                    username: "anon",
                    is_deleted: false,
                },
            ]),
        };

        const useCase = new GetThreadDetailUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        const result = await useCase.execute(threadId);

        expect(result.comments[0].replies).toHaveLength(0);
    });
});
