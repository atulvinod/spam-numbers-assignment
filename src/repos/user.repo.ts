import db from '@src/lib/database';
import user from '@src/models/user.model';
import { ApplicationError, RouteError } from "@src/other/classes";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";
import HttpStatusCodes from "@src/constants/httpStatusCodes";
import { PostgresError } from "postgres";
import * as phoneNumberRepo from "./phone_number.repo";

const errors = {
    USER_ALREADY_EXISTS: new ApplicationError({
        routeError: new RouteError(
            HttpStatusCodes.CONFLICT,
            "User already exists with this email address or phone number"
        ),
    }),
};

export async function findById(id: number) {
    const [result] = await db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1);
    return result;
}

export async function findByEmail(email: string) {
    const [result] = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
    return result;
}

export async function createUser(obj: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    countryCode: string;
}) {
    const existing = await findByEmail(obj.email);
    if (existing) {
        throw errors.USER_ALREADY_EXISTS;
    }

    const hashedPassword = await hash(obj.password, 10);
    const insertValueUser: typeof user.$inferInsert = {
        name: obj.name,
        email: obj.email,
        password: hashedPassword,
    };
    const insertedUser = db.transaction(async (tx) => {
        try {
            const [result] = await tx
                .insert(user)
                .values(insertValueUser)
                .returning({ insertedId: user.id });

            await phoneNumberRepo.createPhoneNumber(
                {
                    phoneNumber: obj.phoneNumber,
                    countryCode: obj.countryCode,
                    isUserSelfNumber: true,
                    contactOfUserId: result.insertedId,
                },
                tx,
            );
            return { id: result.insertedId, email: obj.email, name: obj.name };
        } catch (error) {
            if (error instanceof PostgresError) {
                if (error.constraint_name == "uniqueNumberIndex") {
                    throw errors.USER_ALREADY_EXISTS;
                }
            }
            tx.rollback();
            throw error;
        }
    });

    return insertedUser;
}
