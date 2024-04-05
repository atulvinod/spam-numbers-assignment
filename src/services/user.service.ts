import envVars from "@src/constants/envVars";
import * as repo from "@src/repos/user.repo";
import { sign } from "jsonwebtoken";
import { compare } from "bcrypt";

import errors from "@src/other/errors";

export async function getUserById(id: number) {
    const user = await repo.findById(id);
    if (!user) {
        throw errors.NOT_FOUND;
    }
    return user;
}

export async function getUserByPhoneNumber(
    phoneNumber: string,
    countryCode: string,
) {
    const user = await repo.findByPhoneNumber(phoneNumber, countryCode);
    if (!user) {
        throw errors.NOT_FOUND;
    }
    return user;
}

export async function createRegisteredUser(user: {
    name: string;
    email?: string;
    password: string;
    phoneNumber: string;
    countryCode: string;
}) {
    const inserted = await repo.createRegisteredUser(user);
    return inserted;
}

export async function createUser(user: {
    name: string;
    email?: string;
    phoneNumber: string;
    countryCode: string;
    contactOfUserId: number;
}) {
    const inserted = await repo.createUser(user);
    return inserted;
}

export function generateToken(
    id: number,
    phoneNumber: string,
    countryCode: string,
) {
    const token = sign({ id, phoneNumber, countryCode }, envVars.jwt.secret, {
        expiresIn: envVars.jwt.exp,
        issuer: envVars.jwt.issuer,
        audience: envVars.jwt.audience,
    });
    return token;
}

export async function authenticateLogin(
    phoneNumber: string,
    countryCode: string,
    password: string,
) {
    const existing = await repo.findRegisteredByPhoneNumber(
        phoneNumber,
        countryCode,
    );
    if (!existing || !existing.password) {
        throw errors.NOT_FOUND;
    }

    const comparePwd = await compare(password, existing.password);
    if (!comparePwd) {
        throw errors.EMAIL_PWD_AUTH_ERROR;
    }

    return generateToken(
        existing.id,
        existing.phoneNumber,
        existing.countryCode,
    );
}
