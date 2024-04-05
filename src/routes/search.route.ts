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
    validate(["searchBy", "string", "query"], ["query", "string", "query"]),
    async (req, res, next) => {
        /*
            #swagger.path = '/search'
            #swagger.description = 'Global search for users using name or phone number'
            #swagger.parameters['searchBy'] = {
                in: 'query',
                required: true,
            }
            #swagger.parameters['query'] = {
                in: 'query',
                required: true,
            }
        */
        try {
            const { searchBy, query } = req.query;
            switch (searchBy) {
                case "name": {
                    const result = await searchService.searchByName(
                        query as string
                    );
                    return res.json({ data: { result } });
                }
                default:
                    throw new ApplicationError({
                        routeError: new RouteError(
                            HttpStatusCodes.METHOD_NOT_ALLOWED,
                            "Unsupported searchBy type"
                        ),
                    });
            }
        } catch (error) {
            return routeErrorHandler(error as Error, next);
        }
    }
);

export default api;
