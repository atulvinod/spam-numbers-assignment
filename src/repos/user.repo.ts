import db from '@src/lib/database';
import user from '@src/models/user.model';
import { and, eq } from "drizzle-orm";
import { hash } from "bcrypt";
import * as contactDetailsRepo from "@src/repos/contact_details.repo";
import * as _ from "lodash";
import errors from "@src/other/errors";
import { trx } from "@src/other/classes";

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
    name?: string;
    email?: string;
    phoneNumber: string;
    countryCode: string;
    contactOfUserId?: number;
}) {
    const existing = await findByPhoneNumber(obj.phoneNumber, obj.countryCode);
    if (existing) {
        throw errors.USER_ALREADY_EXISTS;
    }
    const result = await db.transaction(async (trx) => {
        try {
            const [newUser] = await trx
                .insert(user)
                .values({
                    phoneNumber: obj.phoneNumber,
                    countryCode: obj.countryCode,
                    contactOfId: obj.contactOfUserId,
                })
                .returning({ id: user.id });

            if (obj.email || obj.name)
                await contactDetailsRepo.createContactDetails({
                    email: obj.email,
                    name: obj.name,
                    user_id: newUser.id,
                });
            return newUser;
        } catch (error) {
            trx.rollback();
            throw error;
        }
    });

    return result;
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
        await db
            .update(user)
            .set({ isRegisteredUser: true, password: hashedPassword })
            .where(eq(user.id, existing.id));

        return _.pick(existing, ["id", "name", "email"]) as {
            id: number;
            name: string;
            email: string;
        };
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

            await contactDetailsRepo.createContactDetails(
                {
                    name: obj.name,
                    email: obj.email,
                    user_id: newUser.insertedId,
                },
                tx,
            );

            return {
                id: newUser.insertedId,
                phoneNumber: obj.phoneNumber,
                countryCode: obj.countryCode,
            };
        } catch (error) {
            console.log(error)
            tx.rollback();
            throw error;
        }
    });

    return insertedUser;
}
