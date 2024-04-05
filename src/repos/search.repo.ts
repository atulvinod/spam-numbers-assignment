/* eslint-disable max-len */
import db from "@src/lib/database";
import { and, eq, notInArray, sql } from "drizzle-orm";
import userModel from "@src/models/user.model";
import contactDetailsModel from "@src/models/contact_details.model";

export async function getPersonsByName(name: string, currentUserId: number) {
    const startsWithlike = `${name.toLowerCase()}%`;
    const containsLike = `%${name.toLowerCase()}%`;
    const base = db
        .select({
            contact_id: contactDetailsModel.id,
            name: contactDetailsModel.name,
            email: sql`CASE WHEN ${userModel.contactOfId} = ${currentUserId} AND ${userModel.isRegisteredUser} = TRUE THEN ${contactDetailsModel.email} ELSE NULL END AS email`,
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

    const sql2 = await base.where(
        and(
            notInArray(contactDetailsModel.id, aggSql1Ids),
            sql`LOWER(${contactDetailsModel.name}) LIKE ${containsLike}`,
        ),
    );
    return [...sql1, ...sql2];
}
