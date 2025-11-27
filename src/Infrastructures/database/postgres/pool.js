/* istanbul ignore file */
const { Pool } = require("pg");
const InMemoryPool = require("./InMemoryPool");

const testConfig = {
	host: process.env.PGHOST_TEST,
	port: process.env.PGPORT_TEST,
	user: process.env.PGUSER_TEST,
	password: process.env.PGPASSWORD_TEST,
	database: process.env.PGDATABASE_TEST,
};

const useMemory = process.env.USE_MEMORY === "true";

const isTestEnv = process.env.NODE_ENV === "test";

let pool;

if (useMemory) {
	pool = new InMemoryPool();
} else {
	pool = new Pool(isTestEnv ? testConfig : undefined);
}

if (typeof pool.on === "function") {
	pool.on("connect", (client) => {
		if (client?.query) {
			client.query("SET TIME ZONE 'Asia/Jakarta';");
		}
	});
}

module.exports = pool;
