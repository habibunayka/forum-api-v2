const pool = require("../../database/postgres/pool");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");

const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");

describe("ThreadRepositoryPostgres (integration)", () => {
    const fakeIdGenerator = () => "abc123";

    beforeEach(async () => {
        await UsersTableTestHelper.addUser({
            id: "user-123",
            username: "dicoding",
            password: "encrypted",
        });
    });

    afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe("addThread", () => {
        it("should persist thread and return AddedThread correctly", async () => {
            // Arrange
            const newThread = {
                title: "Judul Thread",
                body: "Isi thread",
                owner: "user-123",
            };
            const threadRepository = new ThreadRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            // Act
            const addedThread = await threadRepository.addThread(newThread);

            // Assert
            expect(addedThread).toBeInstanceOf(AddedThread);
            expect(addedThread).toEqual(
                new AddedThread({
                    id: "thread-abc123",
                    title: "Judul Thread",
                    owner: "user-123",
                })
            );

            const threadsInDb =
                await ThreadsTableTestHelper.findThreadById("thread-abc123");
            expect(threadsInDb).toHaveLength(1);
            expect(threadsInDb[0].title).toBe("Judul Thread");
            expect(threadsInDb[0].body).toBe("Isi thread");
        });
    });

    describe("getThreadById", () => {
        it("should return thread detail when found", async () => {
            // Arrange
            await ThreadsTableTestHelper.addThread({
                id: "thread-abc123",
                title: "Judul",
                body: "Isi",
                owner: "user-123",
                date: "2025-07-15T00:00:00.000Z",
            });
            const repository = new ThreadRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            // Act
            const result = await repository.getThreadById("thread-abc123");

            // Assert
            expect(result).toEqual(
                expect.objectContaining({
                    id: "thread-abc123",
                    title: "Judul",
                    body: "Isi",
                    username: "dicoding",
                })
            );
            expect(new Date(result.date).toISOString()).toBe(
                "2025-07-15T00:00:00.000Z"
            );
        });

        it("should throw error when thread not found", async () => {
            const repository = new ThreadRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            await expect(repository.getThreadById("thread-x")).rejects.toThrow(
                "THREAD_REPOSITORY.NOT_FOUND"
            );
        });
    });

    describe("verifyThreadExists", () => {
        it("should resolve when thread exists", async () => {
            await ThreadsTableTestHelper.addThread({
                id: "thread-abc123",
                title: "Judul",
                body: "Isi",
                owner: "user-123",
            });
            const repository = new ThreadRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            await expect(
                repository.verifyThreadExists("thread-abc123")
            ).resolves.not.toThrow("THREAD_REPOSITORY.NOT_FOUND");
        });

        it("should throw NotFoundError when thread does not exist", async () => {
            const repository = new ThreadRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            await expect(
                repository.verifyThreadExists("thread-x")
            ).rejects.toThrow("THREAD_REPOSITORY.NOT_FOUND");
        });
    });
});
