import "../../src/pre-start";
import * as userService from "@src/services/user.service";
import * as spamService from "@src/services/spam.service";

import seedData from "./seed_data.json";

async function seed() {
    console.log("Seeding registered users");
    for (let i = 0; i < seedData.registeredUser.length; i++) {
        const u = seedData.registeredUser[i];
        await userService.createRegisteredUser({
            name: u.name,
            countryCode: u.countryCode,
            password: u.password,
            phoneNumber: u.phoneNumber,
            email: u.email,
        });
    }

    console.log("Seeding normal users");
    for (let i = 0; i < seedData.normalContactUser.length; i++) {
        const u = seedData.normalContactUser[i];
        await userService.createUser({
            contactOfUserId: u.contactOfUserId,
            countryCode: u.countryCode,
            name: u.name,
            phoneNumber: u.phoneNumber,
            email: u.email,
        });
    }

    console.log("Seeding spam reports");
    for (let i = 0; i < seedData.spamRequests.length; i++) {
        try {
            const s = seedData.spamRequests[i];
            await spamService.createSpamReport({
                countryCode: s.countryCode,
                markedByUserId: s.markedByUserId,
                phoneNumber: s.phoneNumber,
            });
        } catch (error) {
            console.error(error);
        }
    }

    console.log("Completed seeding");
    process.exit(0);
}
seed();
