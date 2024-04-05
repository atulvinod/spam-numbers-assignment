import db from '@src/lib/database';
import user from '@src/models/user.model';
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";
import { PostgresError } from "postgres";
import * as phoneNumberRepo from "./phone_number.repo";
import errors from '@src/other/errors';


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

            const existingNumber = await phoneNumberRepo.findPhoneNumber(
                obj.phoneNumber,
                obj.countryCode
            );
            if (existingNumber) {
                await phoneNumberRepo.updatePhoneNumber(
                    existingNumber.id,
                    {
                        isUserSelfNumber: true,
                        contactOfUserId: result.insertedId,
                    },
                    tx
                );
            } else {
                await phoneNumberRepo.createPhoneNumber(
                    {
                        phoneNumber: obj.phoneNumber,
                        countryCode: obj.countryCode,
                        isUserSelfNumber: true,
                        contactOfUserId: result.insertedId,
                    },
                    tx
                );
            }
          
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
