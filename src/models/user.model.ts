import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

const model = pgTable(
    "sns-users",
    {
        id: serial("id").primaryKey(),
        name: text("name").notNull(),
        email: text("email").notNull().unique(),
        password: text("password").notNull(),
        created: timestamp("created").defaultNow(),
    },
    (table) => {
        return {
            emailIdx: index("emailIdx").on(table.email),
        };
    }
);

export default model;
