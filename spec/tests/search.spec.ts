import { Test } from "supertest";
import TestAgent from "supertest/lib/agent";
import { TApiCb } from "spec/types/misc";
import { createRoute } from "@src/util/misc";
import paths from "@src/constants/paths";
import HttpStatusCodes from "@src/constants/httpStatusCodes";
import { getAgent } from "spec/support/utils";
import { duplicateNumberUser, testUser, apiCb } from "spec/support/common";

type searchResponse = {
    data: {
        result: { contact_id: number; name: string; email?: string | null }[];
    };
};

const TIMEOUT = 15000;
describe("[API] Search", () => {
    let agent: TestAgent<Test>;

    beforeAll(() => {
        agent = getAgent();
    });

    describe("[GET] retrieve test user", () => {
        let token: string | null = null;
        it(
            "[POST] should create new user",
            (done) => {
                const callPost = (_: any, cb: TApiCb) =>
                    agent
                        .post(createRoute(paths.users, "login"))
                        .send(testUser)
                        .end(apiCb(cb));

                callPost(null, (res) => {
                    expect(res.status).toBe(HttpStatusCodes.OK);
                    token = (res.body as { data: { token: string } }).data
                        .token;
                    done();
                });
            },
            TIMEOUT,
        );
        it(
            "[GET] should get test user",
            (done) => {
                const callGet = (_: any, cb: TApiCb) =>
                    agent
                        .get(createRoute(paths.search))
                        .set("Authorization", `Bearer ${token}`)
                        .query({
                            searchBy: "name",
                            name: testUser.name,
                        })
                        .end(apiCb(cb));

                callGet(null, (res) => {
                    expect(
                        (res.body as searchResponse).data.result[0].name,
                    ).toEqual(testUser.name);
                    done();
                });
            },
            TIMEOUT,
        );

        it(
            "[GET] should get users containing 't'",
            (done) => {
                const callGet = (_: any, cb: TApiCb) => {
                    agent
                        .get(createRoute(paths.search))
                        .set("Authorization", `Bearer ${token}`)
                        .query({ searchBy: "name", name: "t" })
                        .end(apiCb(cb));
                };

                callGet(null, (res) => {
                    expect(
                        (res.body as searchResponse).data.result.length,
                    ).toBeGreaterThan(0);
                    done();
                });
            },
            TIMEOUT,
        );

        it(
            "[GET] should get user via phone number",
            (done) => {
                const callGet = (_: any, cb: TApiCb) =>
                    agent
                        .get(createRoute(paths.search))
                        .set("Authorization", `Bearer ${token}`)
                        .query({
                            searchBy: "number",
                            phoneNumber: testUser.phoneNumber,
                            countryCode: "+91",
                        })
                        .end(apiCb(cb));

                callGet(null, (res) => {
                    expect(
                        (res.body as searchResponse).data.result.length,
                    ).toEqual(1);
                    done();
                });
            },
            TIMEOUT,
        );

        it(
            "[GET] should return two phone numbers for a duplicate contact",
            (done) => {
                const callGet = (_: any, cb: TApiCb) =>
                    agent
                        .get(createRoute(paths.search))
                        .set("Authorization", `Bearer ${token}`)
                        .query({
                            searchBy: "number",
                            phoneNumber: duplicateNumberUser.phoneNumber,
                            countryCode: "+91",
                        })
                        .end(apiCb(cb));
                callGet(null, (res) => {
                    expect(
                        (res.body as searchResponse).data.result.length,
                    ).toBeGreaterThan(1);
                    done();
                });
            },
            TIMEOUT,
        );
    });
});
