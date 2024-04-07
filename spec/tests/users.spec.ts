import "jasmine";
import * as userService from "@src/services/user.service";
import * as userRepo from "@src/repos/user.repo";
import { hash } from "bcrypt";
import supertest, { Test } from "supertest";
import TestAgent from "supertest/lib/agent";
import { TApiCb } from "spec/types/misc";
import app from "@src/server";
import { createRoute } from "@src/util/misc";
import paths from "@src/constants/paths";
import {
    apiCb,
    ASYNC_TC_TIMEOUT,
    getUserResponseType,
    searchResponseType,
    testUser,
} from "spec/support/common";
import HttpStatusCodes from "@src/constants/httpStatusCodes";
import { faker } from "@faker-js/faker";

const user = {
    name: "test_new_create_user",
    email: "test_new_create_user@email.com",
    password: "password",
    phoneNumber: faker.string.numeric(10),
    countryCode: "+91",
};

const resultValue = {
    id: 1,
    email: user.email,
    name: user.name,
};

describe("[UNIT] test user registration and login", () => {
    it("should create normal user", async () => {
        spyOn(userRepo, "createUser").and.returnValue(
            Promise.resolve({ id: 2 }),
        );
        const result = await userService.createUser({
            phoneNumber: user.phoneNumber,
            countryCode: user.countryCode,
            contactOfUserId: 1,
            name: user.name,
        });
        expect(result).toEqual({ id: 2 });
    });
    it("should create registered user", async () => {
        spyOn(userRepo, "createRegisteredUser").and.returnValue(
            Promise.resolve(resultValue),
        );
        const result = await userService.createRegisteredUser(user);
        expect(result).toEqual(resultValue);
    });
    it("should generate user token", async () => {
        const hashedPassword = await hash(user.password, 10);
        spyOn(userRepo, "findRegisteredByPhoneNumber").and.returnValue(
            Promise.resolve({
                password: hashedPassword,
                id: 1,
                created: new Date(),
                isRegisteredUser: true,
                phoneNumber: user.phoneNumber,
                countryCode: user.countryCode,
                contactOfId: null,
                spamLikelihood: "0",
            }),
        );

        const result = await userService.authenticateLogin(
            user.phoneNumber,
            user.countryCode,
            user.password,
        );
        expect(result).toBeDefined();
    });
});

describe("[API] Validation of user related functionality", () => {
    let agent: TestAgent<Test>;

    beforeAll((done) => {
        agent = supertest.agent(app);
        done();
    });

    describe("[POST]", () => {
        const reqUser = {
            phoneNumber: user.phoneNumber,
            countryCode: user.countryCode,
            password: user.password,
            name: user.name,
        };

        const callLoginPostApi = (cb: TApiCb) =>
            agent
                .post(createRoute(paths.users, "login"))
                .send(testUser)
                .end(apiCb(cb));

        it("should create user", (done) => {
            const callPost = (cb: TApiCb) =>
                agent
                    .post(createRoute(paths.users, "registered"))
                    .send(reqUser)
                    .end(apiCb(cb));
            callPost((res) => {
                expect(res.status).toBe(HttpStatusCodes.CREATED);
                done();
            });
        });

        it("should conflict", (done) => {
            const callPost = (cb: TApiCb) =>
                agent
                    .post(createRoute(paths.users, "registered"))
                    .send(testUser)
                    .end(apiCb(cb));
            callPost((res) => {
                expect(res.status).toBe(HttpStatusCodes.CONFLICT);
                done();
            });
        });

        it("should login", (done) => {
            callLoginPostApi((res) => {
                expect(res.status).toBe(HttpStatusCodes.OK);
                expect(
                    (res.body as { data?: { token: string } })?.data?.token,
                ).toBeDefined();
                done();
            });
        });
    });
});

describe("[API] Validating Adding Contacts", () => {
    let agent: TestAgent<Test>;

    const testContact = {
        name: faker.person.fullName(),
        phoneNumber: "0202020202",
        countryCode: "+91",
        email: faker.internet.email(),
    };

    let testAgentId: number | null = null;
    let testAgentToken: string | null = null;
    let newContactId: number | null = null;

    beforeAll((done) => {
        agent = supertest.agent(app);
        done();
    });

    it(
        "[GET should get the token of test user via login",
        (done) => {
            const callPost = (cb: TApiCb) =>
                agent
                    .post(createRoute(paths.users, "login"))
                    .send({
                        phoneNumber: testUser.phoneNumber,
                        countryCode: testUser.countryCode,
                        password: testUser.password,
                    })
                    .end(apiCb(cb));

            callPost((res) => {
                expect(res.status).toEqual(HttpStatusCodes.OK);
                testAgentToken = (res.body as { data: { token: string } }).data
                    .token;
                done();
            });
        },
        ASYNC_TC_TIMEOUT,
    );

    it(
        "[GET] should get the details of the test user via search",
        (done) => {
            const callGet = (cb: TApiCb) =>
                agent
                    .get(createRoute(paths.search))
                    .query({
                        searchBy: "number",
                        phoneNumber: testUser.phoneNumber,
                        countryCode: testUser.countryCode,
                    })
                    .set("Authorization", `Bearer ${testAgentToken}`)
                    .end(apiCb(cb));

            callGet((res) => {
                expect(res.status).toEqual(HttpStatusCodes.OK);
                expect(
                    (res.body as searchResponseType).data.result.length,
                ).toEqual(1);
                testAgentId = (res.body as searchResponseType).data.result[0]
                    .contact_id;
                done();
            });
        },
        ASYNC_TC_TIMEOUT,
    );

    it(
        "[POST] should create a contact of the test user",
        (done) => {
            const callPost = (cb: TApiCb) =>
                agent
                    .post(createRoute(paths.users))
                    .send({
                        ...testContact,
                        contactOfUserId: testAgentId,
                    })
                    .set("Authorization", `Bearer ${testAgentToken}`)
                    .end(apiCb(cb));

            callPost((res) => {
                if (Number(res.status) != Number(HttpStatusCodes.CREATED)) {
                    console.log(res.body);
                }

                expect(res.status).toEqual(HttpStatusCodes.CREATED);
                done();
            });
        },
        ASYNC_TC_TIMEOUT,
    );

    it("[GET] should get the newly created contact from search", (done) => {
        const callGet = (cb: TApiCb) =>
            agent
                .get(createRoute(paths.search))
                .set("Authorization", `Bearer ${testAgentToken}`)
                .query({
                    searchBy: "number",
                    phoneNumber: testContact.phoneNumber,
                    countryCode: testContact.countryCode,
                })
                .end(apiCb(cb));

        callGet((res) => {
            expect(res.status).toEqual(HttpStatusCodes.OK);
            newContactId = (res.body as searchResponseType).data.result[0]
                .contact_id;
            done();
        });
    });

    it(
        "[GET] should show the email of the newly created contact",
        (done) => {
            const callGet = (cb: TApiCb) =>
                agent
                    .get(createRoute(paths.users))
                    .query({
                        id: newContactId,
                    })
                    .set("Authorization", `Bearer ${testAgentToken}`)
                    .end(apiCb(cb));
            console.log("New contact id", newContactId);
            console.log("token ", testAgentToken);
            callGet((res) => {
                if (res.status != Number(HttpStatusCodes.OK)) {
                    console.log(res.body);
                }
                expect(res.status).toEqual(HttpStatusCodes.OK);
                expect(
                    (res.body as getUserResponseType).data.user.email,
                ).toEqual(testContact.email);
                done();
            });
        },
        ASYNC_TC_TIMEOUT,
    );
});