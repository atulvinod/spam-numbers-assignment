/**
 * Miscellaneous shared classes go here.
 */

import HttpStatusCodes from '@src/constants/httpStatusCodes';


/**
 * Error with status code and message
 */
export class RouteError extends Error {

    public status: HttpStatusCodes;

    public constructor(status: HttpStatusCodes, message: string) {
        super(message);
        this.status = status;
    }
}

export class ApplicationError extends Error {
    public message: string = "error";
    public code?: number;
    public routeError?: RouteError;

    public constructor(opts: {
        message?: string;
        code?: number;
        routeError?: RouteError;
    }) {
        super(opts.message);
        if (opts.message) this.message = opts.message;
        this.code = opts?.code;
        this.routeError = opts?.routeError;
    }
}