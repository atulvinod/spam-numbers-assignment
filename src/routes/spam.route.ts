import { isCountryCode, isPhone, routeErrorHandler } from "@src/util/misc";
import { Router } from "express";
import * as spamService from "@src/services/spam.service";
import jetValidator from "jet-validator";
import HttpStatusCodes from "@src/constants/httpStatusCodes";

const api = Router();
const validator = jetValidator();

api.post(
    "/",
    validator(
        "phoneNumber",
        "countryCode",
        "name",
        ["phoneNumber", isPhone],
        ["countryCode", isCountryCode]
    ),
    async (req, res, next) => {
        /*
        #swagger.path = '/spam'
        #swagger.security = [{
            "bearerAuth":[]
        }]
        #swagger.requestBody = {
            description: 'To create a spam report',
            required: true,
            schema: {
                $ref :"#components/schemas/spamRequest"
            }
        }
        #swagger.responses[201] = {
            schema:{
                $ref :"#components/schemas/spamRequest"
            }
        }
        #swagger.responses[401] = {
            description:"Authentication token is required"
        }
    */
        const { phoneNumber, countryCode, name } = req.body;
        try {
            const spamReport = await spamService.createSpamReport({
                countryCode,
                phoneNumber,
                markedByUserId: (req.user as { id: number }).id,
                name,
            });
            return res
                .status(HttpStatusCodes.CREATED)
                .json({ message: "Created", data: { spamReport } });
        } catch (error) {
            return routeErrorHandler(error as Error, next);
        }
    }
);

export default api;
