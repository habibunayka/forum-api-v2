exports.up = (pgm) => {
    pgm.createTable("commentlikes", {
        id: {
            type: "VARCHAR",
            primaryKey: true,
        },
        comment_id: {
            type: "VARCHAR",
            notNull: true,
        },
        user_id: {
            type: "VARCHAR",
            notNull: true,
        },
    });

    pgm.addConstraint(
        "commentlikes",
        "fk_commentlikes.comment_id_comments.id",
        "FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE"
    );
    pgm.addConstraint(
        "commentlikes",
        "fk_commentlikes.user_id_users.id",
        "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE"
    );
};

exports.down = (pgm) => {
    pgm.dropConstraint(
        "commentlikes",
        "fk_commentlikes.comment_id_comments.id"
    );
    pgm.dropConstraint("commentlikes", "fk_commentlikes.user_id_users.id");
    pgm.dropTable("commentlikes");
};
