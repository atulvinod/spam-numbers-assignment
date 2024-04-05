import "jasmine";
import * as userService from "@src/services/user.service";
import * as userRepo from "@src/repos/user.repo";
import { hash } from "bcrypt";

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

describe("user registration and login", () => {
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
