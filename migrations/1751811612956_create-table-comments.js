exports.up = (pgm) => {
    pgm.createTable("comments", {
        id: {
            type: "VARCHAR",
            primaryKey: true,
        },
        date: {
            type: "timestamptz",
            notNull: true,
        },
        content: {
            type: "TEXT",
            notNull: true,
        },
        thread_id: {
            type: "VARCHAR",
        },
        user_id: {
            type: "VARCHAR",
        },
        is_deleted: {
            type: "BOOLEAN",
            notNull: true,
            default: false,
        },
    });

    pgm.addConstraint(
        "comments",
        "fk_comments.thread_id_threads.id",
        "FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE"
    );
    pgm.addConstraint(
        "comments",
        "fk_comments.user_id_users.id",
        "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE"
    );
};

exports.down = (pgm) => {
    pgm.dropConstraint("comments", "fk_comments.user_id_users.id");
    pgm.dropConstraint("comments", "fk_comments.thread_id_threads.id");
    pgm.dropTable("comments");
};
