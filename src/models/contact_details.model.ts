import {
    serial,
    index,
    text,
    integer,
    timestamp,
    pgSchema,
} from "drizzle-orm/pg-core";

const schema = pgSchema("sns");

const model = schema.table(
    "sns_contact_details",
    {
        id: serial("id").primaryKey(),
        name: text("name").notNull(),
        email: text("email"),
        user_id: integer("user_id").notNull(),
        created: timestamp("created").defaultNow(),
    },
    (table) => {
        return {
            userIdIdx: index("userIdIdx").on(table.user_id),
        };
    },
);

export default model;
