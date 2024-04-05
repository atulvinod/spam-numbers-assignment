/**
 * Miscellaneous shared functions go here.
 */

import { ApplicationError } from '@src/other/classes';
import paths from '@src/constants/paths';

/**
 * Get a random number between 1 and 1,000,000,000,000
 */
export function getRandomInt(): number {
    return Math.floor(Math.random() * 1_000_000_000_000);
}

/**
 * Wait for a certain number of milliseconds.
 */
export function tick(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

export function routeErrorHandler(error: Error, next: (error:Error) => void){
    if(error instanceof ApplicationError){
        if (error.routeError){
            next(error.routeError);
        }else{
            next(error);
        }
        return;
    }

    next(error);
}

export function isOptionalEmail(email: unknown) {
    if (!email) {
        return true;
    }
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email as string);
}

export function isPhone(phone: unknown) {
    return (phone as string).length == 10;
}

export function isCountryCode(code: unknown) {
    return (code as string).startsWith("+");
}

export function createRoute(...path_c: string[]) {
    return [paths.base, ...path_c].join("/");
}