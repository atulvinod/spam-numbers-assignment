import * as spamRepo from "@src/repos/spam.repo";
import * as phoneNumberRepo from "@src/repos/phone_number.repo";

export async function createSpamReport(obj: {
    phoneNumber: string;
    countryCode: string;
    markedSpamByUserId: number;
    name:string;
}) {
    const existingPhoneNumber = await phoneNumberRepo.findPhoneNumber(
        obj.phoneNumber,
        obj.countryCode
    );

    if (existingPhoneNumber) {
        const spamReport = await spamRepo.createSpamReport({
            markedByUserId: obj.markedSpamByUserId,
            phoneNumberId: existingPhoneNumber.id,
            countryCode: obj.countryCode,
            name:obj.name
        });
        return spamReport;
    }

    const newPhoneNumber = await phoneNumberRepo.createPhoneNumber({
        phoneNumber: obj.phoneNumber,
        countryCode: obj.countryCode,
        isUserSelfNumber: false,
    });

    const spamReport = await spamRepo.createSpamReport({
        markedByUserId: obj.markedSpamByUserId,
        phoneNumberId: +newPhoneNumber.id,
        name: obj.name,
        countryCode: obj.countryCode,
    });
    return spamReport;
}
