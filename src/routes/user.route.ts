import { Router } from "express";
import HttpStatusCodes from "@src/constants/httpStatusCodes";
import * as userService from "@src/services/user.service";
import {
    isCountryCode,
    isOptionalEmail,
    isPhone,
    routeErrorHandler,
} from "@src/util/misc";
import jetValidator from "jet-validator";
const validate = jetValidator();
const api = Router();

api.post(
    "/registered",
    validate(
        "name",
        "password",
        "phoneNumber",
        ["phoneNumber", isPhone],
        "countryCode",
        ["countryCode", isCountryCode],
        ["email", isOptionalEmail],
    ),
    async (req, res, next) => {
        /*
            #swagger.description = 'To create user'
            #swagger.path = '/users/registered'
            #swagger.requestBody = {
                description:"To create a new user",
                required: true,
                schema:{
                    $ref : "#components/schemas/createRegUser"
                }
            }
            #swagger.responses[201] = {
                description: "User created",
                schema: {
                    data : {
                        token: "user token"
                    }
                }
            }
         */
        try {
            const { email, name, password, countryCode, phoneNumber } =
                req.body;
            const createdUser = await userService.createRegisteredUser({
                countryCode: countryCode as string,
                email: email as string,
                name: name as string,
                password: password as string,
                phoneNumber: phoneNumber as string,
            });
            const token = userService.generateToken(
                createdUser.id,
                phoneNumber as string,
                countryCode as string,
            );
            return res.status(HttpStatusCodes.CREATED).json({
                message: "created",
                data: { user: createdUser, token },
            });
        } catch (error) {
            return routeErrorHandler(error as Error, next);
        }
    },
);

api.post(
    "/",
    validate(
        "name",
        ["contactOfUserId", "number", "body"],
        "countryCode",
        ["countryCode", isCountryCode],
        "phoneNumber",
        ["phoneNumber", isPhone],
        ["email", isOptionalEmail],
    ),
    async (req, res, next) => {
        /*
            #swagger.path = '/users'
            #swagger.description="To create a non registered user"
            #swagger.requestBody = {
                schema:{
                    $ref :"#components/schemas/createUser"
                }
            }
        */
        try {
            const { name, countryCode, contactOfUserId, phoneNumber, email } =
                req.body;
            const user = await userService.createUser({
                contactOfUserId: contactOfUserId as number,
                countryCode: countryCode as string,
                name: name as string,
                phoneNumber: phoneNumber as string,
                email: email as string,
            });
            return res
                .status(HttpStatusCodes.CREATED)
                .json({ data: { result: user } });
        } catch (error) {
            return routeErrorHandler(error as Error, next);
        }
    },
);

api.post(
    "/login",
    validate("phoneNumber", "password", "countryCode"),
    async (req, res, next) => {
        /*
            #swagger.path = '/users/login'
            #swagger.requestBody = {
                    description: 'Endpoint to login and to get the token',
                    required: true,
                    schema: {
                        $ref: "#components/schemas/login"
                    }
                }
            #swagger.responses[200] = {
                    description: 'If authenticated, will return token',
                    schema: {
                        token :"token"
                    }
            }
     */
        try {
            const { password, countryCode, phoneNumber } = req.body;
            const token = await userService.authenticateLogin(
                phoneNumber as string,
                countryCode as string,
                password as string,
            );
            return res.json({ data: { token } });
        } catch (error) {
            return routeErrorHandler(error as Error, next);
        }
    },
);

api.get("/", validate(["id", "number", "query"]), async (req, res, next) => {
    try {
        /*
            #swagger.path = '/users'
            #swagger.description = 'to get contact details of user'
            #swagger.parameters['id'] = {
                id :"query",
                required: true,
                description : "Id of the contact"
            }
            #swagger.security = [{
                "bearerAuth":[]
            }]
        */
        const { id } = req.query;
        const user = await userService.findUserByContactId(Number(id));
        return res.json({ data: { user } });
    } catch (error) {
        return routeErrorHandler(error as Error, next);
    }
});

export default api;
