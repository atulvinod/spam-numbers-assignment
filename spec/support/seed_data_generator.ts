import { faker } from "@faker-js/faker";
import { writeFileSync } from "fs";
import * as path from "path";

const REGISTERED_USER_COUNT = 10;
const NON_REGISTERED_USER_COUNT = 30;
const SPAM_REPORT_COUNT = 200;

const maxSpamUser = {
    email: "maxspam@gmail.com",
    name: "maxspam@gmail.com",
    password: "maxspam",
    phoneNumber: "6666666666",
    countryCode: "+91",
};

function createRegUser() {
    return {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: faker.internet.password(),
        phoneNumber: faker.string.numeric(10),
        countryCode: "+91",
    };
}

function createNormalUser() {
    return {
        name: faker.person.fullName(),
        phoneNumber: faker.string.numeric(10),
        countryCode: "+91",
        contactOfUserId: Math.floor(Math.random() * 11),
        email: faker.internet.email(),
    };
}

const registeredUser = faker.helpers.multiple(createRegUser, {
    count: REGISTERED_USER_COUNT,
});
registeredUser.push(maxSpamUser);

const normalContactUser = faker.helpers.multiple(createNormalUser, {
    count: NON_REGISTERED_USER_COUNT,
});

const phoneNumbersSet = Array.from(
    [...registeredUser, ...normalContactUser].reduce((agg, v) => {
        agg.add({ phoneNumber: v.phoneNumber, countryCode: v.countryCode });
        return agg;
    }, new Set()),
) as { phoneNumber: string; countryCode: string }[];

function createSpamRequest() {
    const { countryCode, phoneNumber } =
        phoneNumbersSet[
            Math.floor(Math.random() * (REGISTERED_USER_COUNT + 1))
        ];
    return {
        phoneNumber,
        countryCode,
        markedByUserId: Math.floor(Math.random() * (REGISTERED_USER_COUNT + 1)),
    };
}

const spamRequests = faker.helpers.multiple(createSpamRequest, {
    count: SPAM_REPORT_COUNT,
});

const spamRequestsForMaxSpam = faker.helpers.multiple(
    () => ({
        phoneNumber: maxSpamUser.phoneNumber,
        countryCode: maxSpamUser.countryCode,
        markedByUserId: Math.floor(Math.random() * (REGISTERED_USER_COUNT + 1)),
    }),
    { count: Math.floor(SPAM_REPORT_COUNT * 0.75) },
);

spamRequests.push(...spamRequestsForMaxSpam);

const body = {
    spamRequests,
    registeredUser,
    normalContactUser,
};

writeFileSync(path.join(__dirname, "seed_data.json"), JSON.stringify(body));
console.log("Generated test data");
