exports.up = (pgm) => {
    pgm.createTable("threads", {
        id: {
            type: "VARCHAR",
            primaryKey: true,
        },
        title: {
            type: "VARCHAR",
            notNull: true,
        },
        body: {
            type: "TEXT",
            notNull: true,
        },
        date: {
            type: "timestamptz",
            notNull: true,
        },
        owner: {
            type: "VARCHAR",
        },
        is_deleted: {
            type: "BOOLEAN",
            notNull: true,
            default: false,
        },
    });

    pgm.addConstraint(
        "threads",
        "fk_threads.owner_users.id",
        "FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE"
    );
};

exports.down = (pgm) => {
    pgm.dropTable("threads");
};
