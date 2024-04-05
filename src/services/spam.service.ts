import * as spamRepo from "@src/repos/spam.repo";

export async function createSpamReport(obj: {
    phoneNumber: string;
    countryCode: string;
    markedByUserId: number;
    name: string;
}) {
    const result = await spamRepo.createSpamReport(obj);
    return result;
}
