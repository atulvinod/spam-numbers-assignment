import db from "@src/lib/database";
import contactDetailsModel from "@src/models/contact_details.model";
import { trx } from "@src/other/classes";
import userModel from "@src/models/user.model";
import { eq, sql } from "drizzle-orm";

export async function createContactDetails(
    obj: typeof contactDetailsModel.$inferInsert,
    tx?: trx,
) {
    const [result] = await (tx ?? db)
        .insert(contactDetailsModel)
        .values(obj)
        .returning({ insertedId: contactDetailsModel.id });
    return result.insertedId;
}

export async function findUserByContactId(
    contactId: number,
    currentUserId: number,
) {
    const [result] = await db
        .select({
            id: contactDetailsModel.id,
            spam_likelihood: userModel.spamLikelihood,
            name: contactDetailsModel.name,
            email: sql`CASE WHEN ${userModel.contactOfId} = ${currentUserId} THEN ${contactDetailsModel.email} ELSE NULL END AS email`,
            phone_number: userModel.phoneNumber,
            country_code: userModel.countryCode,
        })
        .from(userModel)
        .innerJoin(
            contactDetailsModel,
            eq(userModel.id, contactDetailsModel.user_id),
        )
        .where(eq(contactDetailsModel.id, contactId))
        .limit(1);

    return result;
}