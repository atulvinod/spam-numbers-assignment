import envVars from "@src/constants/envVars";
import * as userRepo from "@src/repos/user.repo";
import { sign } from "jsonwebtoken";
import { compare } from "bcrypt";
import * as contactRepo from "@src/repos/contact_details.repo";

import errors from "@src/other/errors";

export async function getUserById(id: number) {
    const user = await userRepo.findById(id);
    if (!user) {
        throw errors.NOT_FOUND;
    }
    return user;
}

export async function getUserByPhoneNumber(
    phoneNumber: string,
    countryCode: string,
) {
    const user = await userRepo.findByPhoneNumber(phoneNumber, countryCode);
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
    const inserted = await userRepo.createRegisteredUser(user);
    return inserted;
}

export async function createUser(user: {
    name: string;
    email?: string;
    phoneNumber: string;
    countryCode: string;
    contactOfUserId: number;
}) {
    const inserted = await userRepo.createUser(user);
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
    const existing = await userRepo.findRegisteredByPhoneNumber(
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

export async function findUserByContactId(contactId: number) {
    const result = await contactRepo.findUserByContactId(contactId);
    if (!result) {
        throw errors.NOT_FOUND;
    }
    return result;
}

export async function getUserCount() {
    const result = await userRepo.getUserCount();
    return result;
}