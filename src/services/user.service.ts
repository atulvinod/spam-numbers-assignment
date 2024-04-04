import envVars from '@src/constants/envVars';
import { ApplicationError, RouteError } from '@src/other/classes';
import * as repo from '@src/repos/user.repo';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import HttpStatusCodes from '@src/constants/httpStatusCodes';

export const errors = {
    NOT_FOUND: new ApplicationError('User not found'),
    EMAIL_PWD_AUTH_ERROR: new ApplicationError('Email or password is incorrent',
        {
            routeError: new RouteError(HttpStatusCodes.UNAUTHORIZED,
                'Email or password is incorrect'),
        }),
};

export async function getUserById(id: number) {
    const user = await repo.findById(id);
    if (!user) {
        throw errors.NOT_FOUND;
    }
    return user;
}

export async function getUserByEmail(email: string) {
    const user = await repo.findByEmail(email);
    if (!user) {
        throw errors.NOT_FOUND;
    }
    return user;
}

export async function createUser(user: {
    name: string;
    email: string;
    password: string;
}) {
    const inserted = await repo.createUser(user);
    return inserted;
}

export function generateToken(id: number, name:string, email: string) {
    const token = sign({ id, email, name }, envVars.jwt.secret, {
        expiresIn: envVars.jwt.exp,
        issuer: envVars.jwt.issuer,
        audience: envVars.jwt.audience,
    });
    return token;
}

export async function authenticateLogin(email:string, password:string){
    const existing = await repo.findByEmail(email);
    if(!existing){
        throw errors.NOT_FOUND;
    }
    const comparePwd = await compare(password, existing.password);
    if(!comparePwd){
        throw errors.EMAIL_PWD_AUTH_ERROR;
    }

    return generateToken(existing.id, existing.name, existing.email);
}