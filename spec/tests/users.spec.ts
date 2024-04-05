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
    it("should register user", async () => {
        spyOn(userRepo, "createUser").and.returnValue(
            Promise.resolve(resultValue)
        );
        const result = await userService.createUser(user);
        expect(result).toEqual(resultValue);
    });
    it("should generate user token", async () => {
        const hashedPassword = await hash(user.password, 10);
        spyOn(userRepo, "findByEmail").and.returnValue(
            Promise.resolve({
                ...resultValue,
                password: hashedPassword,
                id: 1,
                created: new Date(),
            })
        );

        const result = await userService.authenticateLogin(
            user.email,
            user.password
        );
        expect(result).toBeDefined();
    });
});
