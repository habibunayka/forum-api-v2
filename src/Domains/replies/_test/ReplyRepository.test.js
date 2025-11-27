const ReplyRepository = require("../ReplyRepository");

describe("ReplyRepository interface", () => {
    it("should throw error when invoke unimplemented addReply", async () => {
        const replyRepository = new ReplyRepository();
        await expect(replyRepository.addReply({})).rejects.toThrowError(
            "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED"
        );
    });

    it("should throw error when invoke unimplemented deleteReplyById", async () => {
        const replyRepository = new ReplyRepository();
        await expect(
            replyRepository.deleteReplyById("reply-123")
        ).rejects.toThrowError("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when invoke unimplemented verifyReplyOwner", async () => {
        const replyRepository = new ReplyRepository();
        await expect(
            replyRepository.verifyReplyOwner("reply-123", "user-123")
        ).rejects.toThrowError("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when invoke unimplemented verifyReplyExists", async () => {
        const replyRepository = new ReplyRepository();
        await expect(
            replyRepository.verifyReplyExists("reply-123")
        ).rejects.toThrowError("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when invoke unimplemented getRepliesByCommentId", async () => {
        const replyRepository = new ReplyRepository();
        await expect(
            replyRepository.getRepliesByCommentId(["comment-1"])
        ).rejects.toThrowError("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });

    it("should throw error when invoke unimplemented getRepliesByThreadId", async () => {
        const replyRepository = new ReplyRepository();
        await expect(
            replyRepository.getRepliesByThreadId(["comment-1"])
        ).rejects.toThrowError("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });
});
