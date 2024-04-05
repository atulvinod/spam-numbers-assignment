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
import apiCb from "spec/support/apiCb";
import HttpStatusCodes from "@src/constants/httpStatusCodes";

const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    phoneNumber: "1234567890",
    countryCode: "+91",
};

const resultValue = {
    id: 1,
    email: user.email,
    name: user.name,
};

describe("unit test user registration and login", () => {
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

describe("[API] Registered Users", () => {
    let agent: TestAgent<Test>;

    beforeAll((done) => {
        agent = supertest.agent(app);
        done();
    });

    describe("[POST]", () => {
        const reqUser = {
            phoneNumber: "1234567809",
            countryCode: "+91",
            password: "mypassword",
            name: "test user",
        };
        const callPostApi = (user: any, cb: TApiCb) =>
            agent
                .post(createRoute(paths.users, "registered"))
                .send(reqUser)
                .end(apiCb(cb));

        const callLoginPostApi = (user: any, cb: TApiCb) =>
            agent
                .post(createRoute(paths.users, "login"))
                .send(reqUser)
                .end(apiCb(cb));

        it("should create user", (done) => {
            callPostApi(null, (res) => {
                expect(res.status).toBe(HttpStatusCodes.CREATED);
                done();
            });
        });

        it("should conflict", (done) => {
            callPostApi(null, (res) => {
                expect(res.status).toBe(HttpStatusCodes.CONFLICT);
                done();
            });
        });

        it("should login", (done) => {
            callLoginPostApi(null, (res) => {
                expect(res.status).toBe(HttpStatusCodes.OK);
                expect(
                    (res.body as { data?: { token: string } })?.data?.token,
                ).toBeDefined();
                done();
            });
        });
    });
});