/* eslint-disable max-len */
import db from "@src/lib/database";
import { and, eq, notInArray, sql } from "drizzle-orm";
import userModel from "@src/models/user.model";
import contactDetailsModel from "@src/models/contact_details.model";

export async function searchPersonsByName(name: string, currentUserId: number) {
    const startsWithlike = `${name.toLowerCase()}%`;
    const containsLike = `%${name.toLowerCase()}%`;
    const base = db
        .select({
            contact_id: contactDetailsModel.id,
            name: contactDetailsModel.name,
            email: sql`CASE WHEN (${userModel.contactOfId} = ${currentUserId} AND ${userModel.isRegisteredUser} = TRUE) OR (${userModel.id} = ${currentUserId}) THEN ${contactDetailsModel.email} ELSE NULL END AS email`,
            spam_likelihood: userModel.spamLikelihood,
        })
        .from(contactDetailsModel)
        .leftJoin(userModel, eq(contactDetailsModel.user_id, userModel.id));

    const sql1 = await base.where(
        sql`LOWER(${contactDetailsModel.name}) LIKE ${startsWithlike}`,
    );

    const aggSql1Ids = sql1.reduce((agg: number[], v) => {
        agg.push(v.contact_id);
        return agg;
    }, []);

    if (aggSql1Ids.length) {
        const sql2 = await base.where(
            and(
                notInArray(contactDetailsModel.id, aggSql1Ids),
                sql`LOWER(${contactDetailsModel.name}) LIKE ${containsLike}`,
            ),
        );
        return [...sql1, ...sql2];
    }
    return sql1;
}

export async function searchPersonsByPhone(
    phoneNumber: string,
    countryCode: string,
    currentUserId: number,
) {
    
    const select = {
        contact_id: contactDetailsModel.id,
        name: contactDetailsModel.name,
        email: sql`CASE WHEN (${userModel.contactOfId} = ${currentUserId}  AND ${userModel.isRegisteredUser} = TRUE) OR (${userModel.id} = ${currentUserId}) THEN ${contactDetailsModel.email} ELSE NULL END AS email`,
        spam_likelihood: userModel.spamLikelihood,
    };

    const base = db
        .select(select)
        .from(userModel)
        .leftJoin(
            contactDetailsModel,
            eq(userModel.id, contactDetailsModel.user_id),
        );
    const sql1 = await base.where(
        and(
            eq(userModel.isRegisteredUser, true),
            eq(userModel.countryCode, countryCode),
            eq(userModel.phoneNumber, phoneNumber),
        ),
    );

    if (sql1.length) {
        return sql1;
    }

    const sql2 = await base.where(
        and(
            eq(userModel.countryCode, countryCode),
            eq(userModel.phoneNumber, phoneNumber),
        ),
    );

    return sql2;
}