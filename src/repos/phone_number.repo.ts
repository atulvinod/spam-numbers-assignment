import phoneNumberModel from "@src/models/phone_number.model";
import db from "@src/lib/database";
import { and, eq, ExtractTablesWithRelations } from "drizzle-orm";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { PgTransaction } from "drizzle-orm/pg-core";

type trxType = PgTransaction<
    PostgresJsQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
>;

export async function findPhoneNumber(
    phoneNumber: string,
    countryCode: string,
    trx?: trxType
) {
    const [result] = await (trx ?? db)
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

export async function updatePhoneNumber(
    id: number,
    updateParams: {
        id?: number;
        phoneNumber?: string;
        contactOfUserId?: number | null | undefined;
        isUserSelfNumber?: boolean | null | undefined;
        countryCode?: string | undefined;
        created?: Date | undefined;
    },
    tx?: trxType
) {
    await (tx ?? db)
        .update(phoneNumberModel)
        .set(updateParams)
        .where(eq(phoneNumberModel.id, id));
}

export async function createPhoneNumber(
    obj: {
        phoneNumber: string;
        countryCode: string;
        isUserSelfNumber: boolean;
        contactOfUserId?: number;
    },
    tx?: trxType
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
