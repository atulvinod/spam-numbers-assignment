import spamReportModel from "@src/models/spam_reports.model";
import db from "@src/lib/database";

export async function createSpamReport(obj: {
    markedByUserId: number;
    phoneNumberId: number;
    countryCode: string;
    name: string;
}) {
    const insertValue: typeof spamReportModel.$inferInsert = {
        markedByUserId: obj.markedByUserId,
        phoneNumberId: obj.phoneNumberId,
        name: obj.name,
    };

    const [result] = await db
        .insert(spamReportModel)
        .values(insertValue)
        .returning({ insertedId: spamReportModel.id });
    return { ...obj, id: result.insertedId };
}
