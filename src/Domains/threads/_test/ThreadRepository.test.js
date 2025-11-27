const ThreadRepository = require("../ThreadRepository");

describe("ThreadRepository interface", () => {
    it("should throw error when invoke unimplemented addThread", async () => {
        const repo = new ThreadRepository();
        await expect(repo.addThread({})).rejects.toThrowError(
            "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED"
        );
    });

    it("should throw error when invoke unimplemented getThreadById", async () => {
        const repo = new ThreadRepository();
        await expect(repo.getThreadById("thread-123")).rejects.toThrowError(
            "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED"
        );
    });

    it("should throw error when invoke unimplemented verifyThreadExists", async () => {
        const repo = new ThreadRepository();
        await expect(
            repo.verifyThreadExists("thread-123")
        ).rejects.toThrowError("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    });
});
