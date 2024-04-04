import {
    pgTable,
    serial,
    integer,
    index,
    timestamp,
    unique,
    text
} from "drizzle-orm/pg-core";

const model = pgTable(
    "sns-spam-reports",
    {
        id: serial("id"),
        phoneNumberId: integer("phone_number_id").notNull(),
        markedByUserId: integer("marked_by_user_id").notNull(),
        created: timestamp("created").defaultNow(),
        name: text('name').notNull()
    },
    (table) => {
        return {
            phoneNumberIdIdx: index("phoneNumberIdIdx").on(table.phoneNumberId),
            uniqueMarkedSpam: unique("uniqueMarkedSpam").on(
                table.markedByUserId,
                table.phoneNumberId
            ),
        };
    }
);

export default model;
