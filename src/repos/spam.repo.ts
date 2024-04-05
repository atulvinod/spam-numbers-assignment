import db from "@src/lib/database";
import spamReportModel from "@src/models/spam_reports.model";
import * as usersRepo from "@src/repos/user.repo";

export async function createSpamReport(obj: {
    markedByUserId: number;
    countryCode: string;
    phoneNumber: string;
}) {
    const result = await db.transaction(async (trx) => {
        try {
            const existingPhoneNumber = await usersRepo.findByPhoneNumber(
                obj.phoneNumber,
                obj.countryCode,
                trx,
            );

            if (existingPhoneNumber) {
                const spamReport = await trx.insert(spamReportModel).values({
                    markedByUserId: obj.markedByUserId,
                    phoneNumberId: existingPhoneNumber.id,
                });
                return spamReport;
            }
            const newPhoneNumber = await usersRepo.createUser({
                phoneNumber: obj.phoneNumber,
                countryCode: obj.countryCode,
            });
            const spamReport = await trx.insert(spamReportModel).values({
                markedByUserId: obj.markedByUserId,
                phoneNumberId: +newPhoneNumber.id,
            });
            return spamReport;
        } catch (error) {
            trx.rollback();
            throw error;
        }
    });
    return result;
}
