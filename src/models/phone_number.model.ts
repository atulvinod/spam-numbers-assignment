import {
    pgTable,
    serial,
    text,
    integer,
    boolean,
    varchar,
    unique,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

const model = pgTable(
    "sns-phone-number",
    {
        id: serial("id"),
        phoneNumber: text("phone_number").notNull(),
        contactOfUserId: integer("contact_of_user_id"),
        isUserSelfNumber: boolean("is_user_self_number").default(false),
        countryCode: varchar("country_code", { length: 10 }).notNull(),
        created: timestamp("created").defaultNow(),
    },
    (table) => {
        return {
            numberIndex: index("numberIndex").on(
                table.phoneNumber,
                table.countryCode
            ),
            uniqueNumberIndex: unique("uniqueNumberIndex").on(
                table.phoneNumber,
                table.countryCode
            ),
        };
    }
);

export default model;
