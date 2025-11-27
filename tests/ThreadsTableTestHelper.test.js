const pool = require("../src/Infrastructures/database/postgres/pool");
const ThreadsTableTestHelper = require("./ThreadsTableTestHelper");
const UsersTableTestHelper = require("./UsersTableTestHelper");

describe("ThreadsTableTestHelper", () => {
    afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    it("should insert a thread using default values", async () => {
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.addThread({});

        const threads = await ThreadsTableTestHelper.findThreadById("thread-123");

        expect(threads).toHaveLength(1);
        expect(threads[0]).toMatchObject({
            id: "thread-123",
            title: "default title",
            body: "default body",
            owner: "user-123",
        });
        expect(threads[0].date).toBeDefined();
    });
});
