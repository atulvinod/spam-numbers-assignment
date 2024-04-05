import {
    pgTable,
    serial,
    integer,
    index,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";

const model = pgTable(
    "sns_spam_reports",
    {
        id: serial("id").primaryKey(),
        phoneNumberId: integer("phone_number_id").notNull(),
        markedByUserId: integer("marked_by_user_id").notNull(),
        created: timestamp("created").defaultNow(),
    },
    (table) => {
        return {
            phoneNumberIdIdx: index("phoneNumberIdIdx").on(table.phoneNumberId),
            uniqueMarkedSpam: unique("uniqueMarkedSpam").on(
                table.markedByUserId,
                table.phoneNumberId,
            ),
        };
    },
);

export default model;
