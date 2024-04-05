import db from "@src/lib/database";
import spamReportModel from "@src/models/spam_reports.model";
import { ApplicationError } from "@src/other/classes";
import errors from "@src/other/errors";
import * as usersRepo from "@src/repos/user.repo";
import { PostgresError } from "postgres";

export async function createSpamReport(obj: {
    markedByUserId: number;
    countryCode: string;
    phoneNumber: string;
}) {
    try {
        const result = await db.transaction(async (trx) => {
            const existingPhoneNumber = await usersRepo.findByPhoneNumber(
                obj.phoneNumber,
                obj.countryCode,
                trx,
            );

            if (existingPhoneNumber) {
                const [spamReport] = await trx
                    .insert(spamReportModel)
                    .values({
                        markedByUserId: obj.markedByUserId,
                        phoneNumberId: existingPhoneNumber.id,
                    })
                    .returning({ id: spamReportModel.id });
                return { id: spamReport.id };
            }
            const newPhoneNumber = await usersRepo.createUser({
                phoneNumber: obj.phoneNumber,
                countryCode: obj.countryCode,
            });
            const [spamReport] = await trx
                .insert(spamReportModel)
                .values({
                    markedByUserId: obj.markedByUserId,
                    phoneNumberId: +newPhoneNumber.id,
                })
                .returning({ id: spamReportModel.id });
            return { id: spamReport.id };
        });

        return result;
    } catch (error) {
        if (error instanceof PostgresError) {
            if (error.constraint_name == "uniqueMarkedSpam") {
                throw errors.ALREADY_MARKED_SPAM;
            }
        }
        throw error;
    }
}
