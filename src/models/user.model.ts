import {
    index,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    integer,
    boolean,
} from "drizzle-orm/pg-core";

const model = pgTable(
    "sns_users",
    {
        id: serial("id").primaryKey(),
        phoneNumber: text("phone_number").notNull(),
        countryCode: varchar("country_code", { length: 10 }).notNull(),
        contactOfId: integer("contact_of_id"),
        isRegisteredUser: boolean("is_registered_user").default(false),
        password: text("password"),
        created: timestamp("created").defaultNow(),
    },
    (table) => {
        return {
            phoneNumberIdx: index("phoneNumberIdx").on(
                table.phoneNumber,
                table.countryCode,
            ),
        };
    },
);

export default model;
