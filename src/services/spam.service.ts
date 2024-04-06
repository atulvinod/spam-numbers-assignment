import * as spamRepo from "@src/repos/spam.repo";

export async function createSpamReport(obj: {
    phoneNumber: string;
    countryCode: string;
    markedByUserId: number;
}) {
    const result = await spamRepo.createSpamReport(obj);
    return result;
}


export async function getSpamReportCount() {
    const result = await spamRepo.getSpamReportCount();
    return result;
}