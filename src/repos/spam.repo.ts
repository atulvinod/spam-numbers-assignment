import * as phoneNumberRepo from "@src/repos/phone_number.repo";
import db from "@src/lib/database";
import spamReportModel from "@src/models/spam_reports.model";

export async function createSpamReport(obj: {
    markedByUserId: number;
    countryCode: string;
    name: string;
    phoneNumber: string;
}) {
    const result = await db.transaction(async (trx) => {
        try {
            const existingPhoneNumber = await phoneNumberRepo.findPhoneNumber(
                obj.phoneNumber,
                obj.countryCode,
                trx
            );

            if (existingPhoneNumber) {
                const spamReport = await trx.insert(spamReportModel).values({
                    markedByUserId: obj.markedByUserId,
                    phoneNumberId: existingPhoneNumber.id,
                    name: obj.name,
                });
                return spamReport;
            }
            const newPhoneNumber = await phoneNumberRepo.createPhoneNumber({
                phoneNumber: obj.phoneNumber,
                countryCode: obj.countryCode,
                isUserSelfNumber: false,
            });
            const spamReport = await trx.insert(spamReportModel).values({
                markedByUserId: obj.markedByUserId,
                phoneNumberId: +newPhoneNumber.id,
                name: obj.name,
            });
            return spamReport;
        } catch (error) {
            trx.rollback();
            throw error;
        }
    });
    return result;
}
