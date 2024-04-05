import {
    serial,
    index,
    pgTable,
    text,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";

const model = pgTable(
    "sns-contact-details",
    {
        id: serial("id").primaryKey(),
        name: text("name"),
        email: text("email"),
        user_id: integer("user_id"),
        created: timestamp("created").defaultNow(),
    },
    (table) => {
        return {
            userIdIdx: index("userIdIdx").on(table.user_id),
        };
    },
);

export default model;
