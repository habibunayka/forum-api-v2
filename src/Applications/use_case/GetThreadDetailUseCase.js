const DetailThread = require("../../Domains/threads/entities/DetailThread");
const DetailComment = require("../../Domains/comments/entities/DetailComment");
const DetailReply = require("../../Domains/replies/entities/DetailReply");

class GetThreadDetailUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(threadId) {
        const thread = await this._threadRepository.getThreadById(threadId);
        const comments =
            await this._commentRepository.getCommentsByThreadId(threadId);
        const replies =
            await this._replyRepository.getRepliesByThreadId(threadId);

        const commentsWithReplies = comments.map((comment) => {
            const commentReplies = replies
                .filter((reply) => reply.comment_id === comment.id)
                .map(
                    (reply) =>
                        new DetailReply({
                            id: reply.id,
                            comment_id: reply.comment_id,
                            content: reply.content,
                            date:
                                typeof reply.date === "string"
                                    ? reply.date
                                    : new Date(reply.date).toISOString(),
                            username: reply.username,
                            is_deleted: reply.is_deleted,
                        })
                );

            return new DetailComment({
                id: comment.id,
                username: comment.username,
                date:
                    typeof comment.date === "string"
                        ? comment.date
                        : new Date(comment.date).toISOString(),
                content: comment.content,
                is_deleted: comment.is_deleted,
                replies: commentReplies,
                likeCount: (() => {
                    const raw =
                        comment.like_count !== undefined
                            ? comment.like_count
                            : comment.likeCount;
                    const parsed =
                        raw !== undefined ? Number.parseInt(raw, 10) : 0;
                    return Number.isNaN(parsed) ? 0 : parsed;
                })(),
            });
        });

        return new DetailThread({
            id: thread.id,
            title: thread.title,
            body: thread.body,
            date:
                typeof thread.date === "string"
                    ? thread.date
                    : new Date(thread.date).toISOString(),
            username: thread.username,
            comments: commentsWithReplies,
        });
    }
}

module.exports = GetThreadDetailUseCase;
