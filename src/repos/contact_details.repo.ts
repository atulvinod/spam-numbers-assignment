import db from "@src/lib/database";
import contactDetailsModel from "@src/models/contact_details.model";
import { trx } from "@src/other/classes";

export async function createContactDetails(
    obj: typeof contactDetailsModel.$inferInsert,
    tx?: trx,
) {
    const [result] = await(tx ?? db)
        .insert(contactDetailsModel)
        .values(obj)
        .returning({ insertedId: contactDetailsModel.id });
    return result.insertedId;
}
