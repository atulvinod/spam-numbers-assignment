import { Test } from "supertest";
import TestAgent from "supertest/lib/agent";
import { TApiCb } from "spec/types/misc";
import { createRoute } from "@src/util/misc";
import paths from "@src/constants/paths";
import apiCb from "spec/support/apiCb";
import HttpStatusCodes from "@src/constants/httpStatusCodes";
import { getAgent } from "spec/support/utils";

type searchResponse = {
    data: {
        result: { contact_id: number; name: string; email?: string | null }[];
    };
};

describe("[API] Search", () => {
    let agent: TestAgent<Test>;

    beforeAll(() => {
        agent = getAgent();
    });

    describe("[GET] retrieve test user", () => {
        let token: string | null = null;
        it("[POST] should login user", (done) => {
            const callPost = (_: any, cb: TApiCb) =>
                agent
                    .post(createRoute(paths.users, "login"))
                    .send({
                        phoneNumber: "0000000000",
                        countryCode: "+91",
                        password: "testuserpassword",
                    })
                    .end(apiCb(cb));

            callPost(null, (res) => {
                expect(res.status).toBe(HttpStatusCodes.OK);
                token = (res.body as { data: { token: string } }).data.token;
                done();
            });
        });
        it("[GET] should get test user", (done) => {
            const callGet = (_: any, cb: TApiCb) =>
                agent
                    .get(createRoute(paths.search))
                    .set("Authorization", `Bearer ${token}`)
                    .query({
                        searchBy: "name",
                        name: "test",
                    })
                    .end(apiCb(cb));

            callGet(null, (res) => {
                expect(
                    (res.body as searchResponse).data.result[0].name,
                ).toEqual("testuser");
                done();
            });
        }, 10000);

        it("[GET] should get users containing 't'", (done) => {
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
        }, 10000);
    });
});
