import phoneNumberModel from "@src/models/phone_number.model";
import db from "@src/lib/database";
import { and, eq, ExtractTablesWithRelations } from "drizzle-orm";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { PgTransaction } from "drizzle-orm/pg-core";

export async function findPhoneNumber(
    phoneNumber: string,
    countryCode: string
) {
    const [result] = await db
        .select()
        .from(phoneNumberModel)
        .where(
            and(
                eq(phoneNumberModel.phoneNumber, phoneNumber),
                eq(phoneNumberModel.countryCode, countryCode)
            )
        )
        .limit(1);
    return result;
}

export async function createPhoneNumber(
    obj: {
        phoneNumber: string;
        countryCode: string;
        isUserSelfNumber: boolean;
        contactOfUserId?: number;
    },
    tx?: PgTransaction<
        PostgresJsQueryResultHKT,
        Record<string, never>,
        ExtractTablesWithRelations<Record<string, never>>
    >
) {
    const insertValuePhoneNumber: typeof phoneNumberModel.$inferInsert = {
        phoneNumber: obj.phoneNumber,
        countryCode: obj.countryCode,
        isUserSelfNumber: obj.isUserSelfNumber,
        contactOfUserId: obj.contactOfUserId,
    };
    const [result] = await (tx ?? db)
        .insert(phoneNumberModel)
        .values(insertValuePhoneNumber)
        .returning({ insertedId: phoneNumberModel.id });
    return { ...insertValuePhoneNumber, id: result.insertedId };
}
