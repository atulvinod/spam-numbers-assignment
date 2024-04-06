/* eslint-disable indent */
import { routeErrorHandler } from "@src/util/misc";
import { Router } from "express";
import jetValidator from "jet-validator";
import * as searchService from "@src/services/search.service";
import { ApplicationError, RouteError } from "@src/other/classes";
import HttpStatusCodes from "@src/constants/httpStatusCodes";

const api = Router();
const validate = jetValidator();

api.get(
    "/",
    validate(["searchBy", "string", "query"]),
    async (req, res, next) => {
        /*
            #swagger.path = '/search'
            #swagger.description = 'Global search for users using name or phone number'
            #swagger.parameters['searchBy'] = {
                in: 'query',
                required: true,
                description: "Only two valid values, 'name' and 'number'"
            }
            #swagger.parameters['name'] = {
                in: 'query',
            }
            #swagger.parameters['phoneNumber'] = {
                in : 'query',
            }
            #swagger.parameters['countryCode'] = {
                in:'query',
            }
            #swagger.security = [{
            "bearerAuth":[]
            }]
        */
        try {
            const { searchBy, name, phoneNumber, countryCode } = req.query;
            switch (searchBy) {
                case "name": {
                    const result = await searchService.searchByName(
                        name as string,
                        (req.user as { id: number }).id,
                    );
                    return res.json({ data: { result } });
                }
                case "number": {
                    if (!phoneNumber || !countryCode) {
                        throw new RouteError(
                            HttpStatusCodes.BAD_REQUEST,
                            "Phone number or country code is missing",
                        );
                    }
                    const result = await searchService.searchByPhone(
                        phoneNumber as string,
                        countryCode as string,
                        (req.user as { id: number }).id,
                    );
                    return res.json({ data: { result } });
                }
                default:
                    throw new ApplicationError({
                        routeError: new RouteError(
                            HttpStatusCodes.METHOD_NOT_ALLOWED,
                            "Unsupported searchBy type",
                        ),
                    });
            }
        } catch (error) {
            return routeErrorHandler(error as Error, next);
        }
    },
);

export default api;
