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
    public message: string;
    public code?: number;
    public routeError?: RouteError;

    public constructor(message:string, opts?: 
        { code?: number, routeError?: RouteError}){
        super(message);
        this.message = message;
        this.code = opts?.code;
        this.routeError = opts?.routeError;
    }
}