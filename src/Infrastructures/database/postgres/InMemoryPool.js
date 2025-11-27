/* istanbul ignore file */

class InMemoryPool {
    constructor() {
        this._reset();
    }

    _reset() {
        this._tables = {
            users: [],
            authentications: [],
            threads: [],
            comments: [],
            replies: [],
        };
    }

    on() {
        // Mimic pg Pool interface; no-op for in-memory store
        return this;
    }

    async end() {
        this._reset();
    }

    _normalizeQuery(text) {
        return text.replace(/\s+/g, " ").trim().toLowerCase();
    }

    _toDate(value) {
        if (value instanceof Date) return value;
        const date = value ? new Date(value) : new Date();
        return Number.isNaN(date.getTime()) ? new Date() : date;
    }

    _clone(row) {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
                key,
                value instanceof Date ? new Date(value.getTime()) : value,
            ])
        );
    }

    _sortByDateAsc(rows) {
        return rows.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }

    async query(queryConfig) {
        const { text, values = [] } =
            typeof queryConfig === "string"
                ? { text: queryConfig, values: [] }
                : queryConfig;

        const normalized = this._normalizeQuery(text);

        if (normalized.startsWith("set time zone")) {
            return { rows: [], rowCount: 0 };
        }

        // USERS
        if (normalized.startsWith("insert into users")) {
            const [id, username, password, fullname] = values;
            this._tables.users.push({ id, username, password, fullname });
            const rows = normalized.includes("returning")
                ? [{ id, username, fullname }]
                : [];
            return { rows, rowCount: 1 };
        }

        if (normalized.startsWith("select * from users where id = $1")) {
            const id = values[0];
            const rows = this._tables.users
                .filter((u) => u.id === id)
                .map((u) => this._clone(u));
            return { rows, rowCount: rows.length };
        }

        if (
            normalized.startsWith(
                "select username from users where username = $1"
            )
        ) {
            const username = values[0];
            const rows = this._tables.users
                .filter((u) => u.username === username)
                .map((u) => ({ username: u.username }));
            return { rows, rowCount: rows.length };
        }

        if (
            normalized.startsWith(
                "select password from users where username = $1"
            )
        ) {
            const username = values[0];
            const rows = this._tables.users
                .filter((u) => u.username === username)
                .map((u) => ({ password: u.password }));
            return { rows, rowCount: rows.length };
        }

        if (
            normalized.startsWith(
                "select id from users where username = $1"
            )
        ) {
            const username = values[0];
            const rows = this._tables.users
                .filter((u) => u.username === username)
                .map((u) => ({ id: u.id }));
            return { rows, rowCount: rows.length };
        }

        if (normalized.startsWith("delete from users")) {
            const count = this._tables.users.length;
            this._tables.users = [];
            return { rows: [], rowCount: count };
        }

        // AUTHENTICATIONS
        if (normalized.startsWith("insert into authentications")) {
            const [token] = values;
            this._tables.authentications.push({ token });
            return { rows: [], rowCount: 1 };
        }

        if (
            normalized.startsWith(
                "select token from authentications where token = $1"
            )
        ) {
            const token = values[0];
            const rows = this._tables.authentications
                .filter((t) => t.token === token)
                .map((t) => ({ token: t.token }));
            return { rows, rowCount: rows.length };
        }

        if (
            normalized.startsWith(
                "delete from authentications where token = $1"
            )
        ) {
            const token = values[0];
            const before = this._tables.authentications.length;
            this._tables.authentications = this._tables.authentications.filter(
                (t) => t.token !== token
            );
            return {
                rows: [],
                rowCount: before - this._tables.authentications.length,
            };
        }

        if (normalized.startsWith("delete from authentications")) {
            const count = this._tables.authentications.length;
            this._tables.authentications = [];
            return { rows: [], rowCount: count };
        }

        // THREADS
        if (normalized.startsWith("insert into threads")) {
            const [id, title, body, owner, dateValue] = values;
            const date = this._toDate(dateValue);
            this._tables.threads.push({ id, title, body, owner, date });
            const rows = normalized.includes("returning")
                ? [{ id, title, owner }]
                : [];
            return { rows, rowCount: 1 };
        }

        if (normalized.startsWith("select * from threads where id = $1")) {
            const id = values[0];
            const rows = this._tables.threads
                .filter((t) => t.id === id)
                .map((t) => this._clone(t));
            return { rows, rowCount: rows.length };
        }

        if (
            normalized.startsWith(
                "select threads.id, threads.title, threads.body, threads.date, users.username from threads join users on threads.owner = users.id where threads.id = $1"
            )
        ) {
            const id = values[0];
            const thread = this._tables.threads.find((t) => t.id === id);
            if (!thread) return { rows: [], rowCount: 0 };
            const user = this._tables.users.find((u) => u.id === thread.owner);
            return {
                rows: [
                    this._clone({
                        id: thread.id,
                        title: thread.title,
                        body: thread.body,
                        date: thread.date,
                        username: user?.username,
                    }),
                ],
                rowCount: 1,
            };
        }

        if (normalized.startsWith("select id from threads where id = $1")) {
            const id = values[0];
            const rows = this._tables.threads
                .filter((t) => t.id === id)
                .map((t) => ({ id: t.id }));
            return { rows, rowCount: rows.length };
        }

        if (normalized.startsWith("delete from threads")) {
            const count = this._tables.threads.length;
            this._tables.threads = [];
            return { rows: [], rowCount: count };
        }

        // COMMENTS
        if (normalized.startsWith("insert into comments")) {
            const [id, content, dateValue, threadId, userId, maybeDeleted] =
                values;
            const date = this._toDate(dateValue);
            const is_deleted =
                typeof maybeDeleted === "boolean" ? maybeDeleted : false;
            this._tables.comments.push({
                id,
                content,
                date,
                thread_id: threadId,
                user_id: userId,
                is_deleted,
            });
            const rows = normalized.includes("returning")
                ? [{ id, content, owner: userId }]
                : [];
            return { rows, rowCount: 1 };
        }

        if (
            normalized.startsWith(
                "select comments.id, users.username, comments.date, comments.content, comments.is_deleted from comments join users on comments.user_id = users.id where comments.thread_id = $1"
            )
        ) {
            const threadId = values[0];
            const rows = this._tables.comments
                .filter((c) => c.thread_id === threadId)
                .map((c) => {
                    const user =
                        this._tables.users.find((u) => u.id === c.user_id) ||
                        {};
                    return {
                        id: c.id,
                        username: user.username,
                        date: c.date,
                        content: c.content,
                        is_deleted: Boolean(c.is_deleted),
                    };
                });
            this._sortByDateAsc(rows);
            return {
                rows: rows.map((r) => this._clone(r)),
                rowCount: rows.length,
            };
        }

        if (normalized.startsWith("select * from comments where id = $1")) {
            const id = values[0];
            const rows = this._tables.comments
                .filter((c) => c.id === id)
                .map((c) => this._clone(c));
            return { rows, rowCount: rows.length };
        }

        if (
            normalized.startsWith(
                "select is_deleted from comments where id = $1"
            )
        ) {
            const id = values[0];
            const rows = this._tables.comments
                .filter((c) => c.id === id)
                .map((c) => ({ is_deleted: Boolean(c.is_deleted) }));
            return { rows, rowCount: rows.length };
        }

        if (normalized.startsWith("select id from comments where id = $1")) {
            const id = values[0];
            const rows = this._tables.comments
                .filter((c) => c.id === id)
                .map((c) => ({ id: c.id }));
            return { rows, rowCount: rows.length };
        }

        if (normalized.startsWith("select user_id from comments where id = $1")) {
            const id = values[0];
            const rows = this._tables.comments
                .filter((c) => c.id === id)
                .map((c) => ({ user_id: c.user_id }));
            return { rows, rowCount: rows.length };
        }

        if (
            normalized.startsWith(
                "update comments set is_deleted = true where id = $1"
            )
        ) {
            const id = values[0];
            const comment = this._tables.comments.find((c) => c.id === id);
            if (comment) {
                comment.is_deleted = true;
                return { rows: [], rowCount: 1 };
            }
            return { rows: [], rowCount: 0 };
        }

        if (normalized.startsWith("delete from comments")) {
            const count = this._tables.comments.length;
            this._tables.comments = [];
            return { rows: [], rowCount: count };
        }

        // REPLIES
        if (normalized.startsWith("insert into replies")) {
            const [
                id,
                content,
                commentId,
                userId,
                dateValue,
                maybeDeleted,
            ] = values;
            const date = this._toDate(dateValue);
            const is_deleted =
                typeof maybeDeleted === "boolean" ? maybeDeleted : false;
            this._tables.replies.push({
                id,
                content,
                comment_id: commentId,
                user_id: userId,
                date,
                is_deleted,
            });
            const rows = normalized.includes("returning")
                ? [{ id, content, owner: userId }]
                : [];
            return { rows, rowCount: 1 };
        }

        if (normalized.startsWith("select * from replies where id = $1")) {
            const id = values[0];
            const rows = this._tables.replies
                .filter((r) => r.id === id)
                .map((r) => this._clone(r));
            return { rows, rowCount: rows.length };
        }

        if (
            normalized.startsWith(
                "update replies set is_deleted = true where id = $1"
            )
        ) {
            const id = values[0];
            const reply = this._tables.replies.find((r) => r.id === id);
            if (reply) {
                reply.is_deleted = true;
                return { rows: [], rowCount: 1 };
            }
            return { rows: [], rowCount: 0 };
        }

        if (
            normalized.startsWith(
                "select id from replies where id = $1 and user_id = $2"
            )
        ) {
            const [replyId, userId] = values;
            const rows = this._tables.replies
                .filter((r) => r.id === replyId && r.user_id === userId)
                .map((r) => ({ id: r.id }));
            return { rows, rowCount: rows.length };
        }

        if (normalized.startsWith("select id from replies where id = $1")) {
            const replyId = values[0];
            const rows = this._tables.replies
                .filter((r) => r.id === replyId)
                .map((r) => ({ id: r.id }));
            return { rows, rowCount: rows.length };
        }

        if (
            normalized.includes("from replies left join users") &&
            normalized.includes("comment_id = any($1::text[])")
        ) {
            const commentIds = values[0] || [];
            const rows = this._tables.replies
                .filter((r) => commentIds.includes(r.comment_id))
                .map((r) => {
                    const user =
                        this._tables.users.find((u) => u.id === r.user_id) ||
                        {};
                    return {
                        id: r.id,
                        content: r.content,
                        date: r.date,
                        comment_id: r.comment_id,
                        is_deleted: Boolean(r.is_deleted),
                        username: user.username,
                    };
                });
            this._sortByDateAsc(rows);
            return {
                rows: rows.map((r) => this._clone(r)),
                rowCount: rows.length,
            };
        }

        if (
            normalized.includes("from replies join comments") &&
            normalized.includes("where comments.thread_id = $1")
        ) {
            const threadId = values[0];
            const commentIds = this._tables.comments
                .filter((c) => c.thread_id === threadId)
                .map((c) => c.id);
            const rows = this._tables.replies
                .filter((r) => commentIds.includes(r.comment_id))
                .map((r) => {
                    const user =
                        this._tables.users.find((u) => u.id === r.user_id) ||
                        {};
                    return {
                        id: r.id,
                        comment_id: r.comment_id,
                        content: r.content,
                        date: r.date,
                        is_deleted: Boolean(r.is_deleted),
                        username: user.username,
                    };
                });
            this._sortByDateAsc(rows);
            return {
                rows: rows.map((r) => this._clone(r)),
                rowCount: rows.length,
            };
        }

        if (normalized.startsWith("delete from replies")) {
            const count = this._tables.replies.length;
            this._tables.replies = [];
            return { rows: [], rowCount: count };
        }

        throw new Error(`Unsupported in-memory query: ${normalized}`);
    }
}

module.exports = InMemoryPool;
