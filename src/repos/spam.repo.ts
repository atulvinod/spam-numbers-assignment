import db from "@src/lib/database";
import spamReportModel from "@src/models/spam_reports.model";
import { trx } from "@src/other/classes";
import errors from "@src/other/errors";
import * as usersRepo from "@src/repos/user.repo";
import { count, eq } from "drizzle-orm";
import { PostgresError } from "postgres";
import userModel from "@src/models/user.model";

async function updateSpamLikelihood(phoneNumberId: number, tx: trx) {
    const [totalCount] = await tx
        .select({ count: count() })
        .from(spamReportModel);

    const [spamCountOfNumber] = await tx
        .select({ count: count() })
        .from(spamReportModel)
        .where(eq(spamReportModel.id, phoneNumberId));

    const percentage = (spamCountOfNumber.count / totalCount.count).toPrecision(
        2,
    );
    await tx
        .update(userModel)
        .set({ spamLikelihood: percentage })
        .where(eq(userModel.id, phoneNumberId));
}

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
                await updateSpamLikelihood(existingPhoneNumber.id, trx);
                return { id: spamReport.id };
            }
            const newPhoneNumber = await usersRepo.createUser({
                name: "Spam number",
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
            await updateSpamLikelihood(+newPhoneNumber.id, trx);
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

export async function getSpamReportCount() {
    const [result] = await db.select({ count: count() }).from(spamReportModel);
    return result.count;
}