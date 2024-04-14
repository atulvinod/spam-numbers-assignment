import {
    index,
    serial,
    text,
    timestamp,
    varchar,
    integer,
    boolean,
    numeric,
    pgSchema,
} from "drizzle-orm/pg-core";

const schema = pgSchema("sns");

const model = schema.table(
    "sns_users",
    {
        id: serial("id").primaryKey(),
        phoneNumber: text("phone_number").notNull(),
        countryCode: varchar("country_code", { length: 10 }).notNull(),
        contactOfId: integer("contact_of_id"),
        isRegisteredUser: boolean("is_registered_user").default(false),
        password: text("password"),
        created: timestamp("created").defaultNow(),
        spamLikelihood: numeric("spam_likelihood").default("0"),
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
