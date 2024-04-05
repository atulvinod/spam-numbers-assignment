import HttpStatusCodes from "@src/constants/httpStatusCodes";
import { ApplicationError, RouteError } from "./classes";

export default {
    USER_ALREADY_EXISTS: new ApplicationError({
        routeError: new RouteError(
            HttpStatusCodes.CONFLICT,
            "User already exists with this email address or phone number"
        ),
    }),
    NOT_FOUND: new ApplicationError({
        routeError: new RouteError(HttpStatusCodes.NOT_FOUND, "User not found"),
    }),
    EMAIL_PWD_AUTH_ERROR: new ApplicationError({
        routeError: new RouteError(
            HttpStatusCodes.UNAUTHORIZED,
            "Email or password is incorrect"
        ),
    }),
    ALREADY_MARKED_SPAM: new ApplicationError({
        routeError: new RouteError(
            HttpStatusCodes.CONFLICT,
            "You have already marked this number as spam"
        ),
    }),
};
