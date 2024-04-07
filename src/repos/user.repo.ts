import db from '@src/lib/database';
import user from '@src/models/user.model';
import { and, count, eq } from "drizzle-orm";
import { hash } from "bcrypt";
import * as contactDetailsRepo from "@src/repos/contact_details.repo";
import * as _ from "lodash";
import errors from "@src/other/errors";
import { trx } from "@src/other/classes";
import { PostgresError } from "postgres";

export async function findById(id: number) {
    const [result] = await db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1);
    return result;
}

export async function findByPhoneNumber(
    phoneNumber: string,
    countryCode: string,
    trx?: trx,
) {
    const [result] = await (trx ?? db)
        .select()
        .from(user)
        .where(
            and(
                eq(user.phoneNumber, phoneNumber),
                eq(user.countryCode, countryCode),
            ),
        )
        .limit(1);
    return result;
}

export async function findRegisteredByPhoneNumber(
    phoneNumber: string,
    countryCode: string,
) {
    const [result] = await db
        .select()
        .from(user)
        .where(
            and(
                eq(user.phoneNumber, phoneNumber),
                eq(user.countryCode, countryCode),
                eq(user.isRegisteredUser, true),
            ),
        )
        .limit(1);
    return result;
}

export async function createUser(obj: {
    name: string;
    email?: string | null;
    phoneNumber: string;
    countryCode: string;
    contactOfUserId?: number;
}) {
    const existing = await findByPhoneNumber(obj.phoneNumber, obj.countryCode);
    if (existing) {
        const id = await contactDetailsRepo.createContactDetails({
            email: obj.email,
            name: obj.name,
            user_id: existing.id,
        });

        return {
            id,
        };
    }
    try {
        const result = await db.transaction(async (trx) => {
            const [newUser] = await trx
                .insert(user)
                .values({
                    phoneNumber: obj.phoneNumber,
                    countryCode: obj.countryCode,
                    contactOfId: obj.contactOfUserId,
                })
                .returning({ id: user.id });

            const id = await contactDetailsRepo.createContactDetails(
                {
                    email: obj.email,
                    name: obj.name,
                    user_id: newUser.id,
                },
                trx,
            );
            return {
                id,
            };
        });
        return result;
    } catch (error) {
        if (error instanceof PostgresError) {
            if (error.constraint_name == "phoneNumberIdx") {
                throw errors.USER_ALREADY_EXISTS;
            }
        }
        throw error;
    }
}

async function setUserAsRegistered(
    userId: number,
    password: string,
    trx?: trx,
) {
    await (trx ?? db)
        .update(user)
        .set({ isRegisteredUser: true, password })
        .where(eq(user.id, userId));
}

export async function createRegisteredUser(obj: {
    name: string;
    email?: string;
    password: string;
    phoneNumber: string;
    countryCode: string;
}) {
    const hashedPassword = await hash(obj.password, 10);
    const existing = await findRegisteredByPhoneNumber(
        obj.phoneNumber,
        obj.countryCode,
    );
    if (existing) {
        if (existing.isRegisteredUser) {
            throw errors.USER_ALREADY_EXISTS;
        }
        const updatedExistingUser = db.transaction(async (trx) => {
            const existingContacts =
                await contactDetailsRepo.findContactByUserId(existing.id);
            if (existingContacts.length) {
                /**If user already existed in system, but was not registered,
                 *  then delete all previous contacts and create new one  */
                const aggregateIds = existingContacts.reduce(
                    (agg: number[], v) => {
                        agg.push(v.id);
                        return agg;
                    },
                    [],
                );

                await contactDetailsRepo.deleteContacts(aggregateIds, trx);
            }
            const id = await contactDetailsRepo.createContactDetails(
                {
                    name: obj.name,
                    user_id: existing.id,
                    email: obj.email,
                },
                trx,
            );
            await setUserAsRegistered(existing.id, hashedPassword, trx);
            return {
                id,
            };
        });
        return updatedExistingUser;
    }

    const insertedUser = await db.transaction(async (tx) => {
        try {
            const [newUser] = await tx
                .insert(user)
                .values({
                    isRegisteredUser: true,
                    phoneNumber: obj.phoneNumber,
                    countryCode: obj.countryCode,
                    password: hashedPassword,
                })
                .returning({ insertedId: user.id });

            const id = await contactDetailsRepo.createContactDetails(
                {
                    name: obj.name,
                    email: obj.email,
                    user_id: newUser.insertedId,
                },
                tx,
            );

            return {
                id,
            };
        } catch (error) {
            tx.rollback();
            throw error;
        }
    });

    return insertedUser;
}

export async function getUserCount() {
    const [result] = await db.select({ count: count() }).from(user);
    return result.count;
}