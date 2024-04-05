import db from '@src/lib/database';
import { sql } from "drizzle-orm";
import userModel from "@src/models/user.model";
import phoneNumberModel from "@src/models/phone_number.model";
import spamReportsModel from "@src/models/spam_reports.model";
import { PgDialect } from "drizzle-orm/pg-core";

export async function getPersonsByName(name: string) {
    // join three tables to get the full name,
    const like = `${name.toLowerCase()}%`;
    const sql1 = sql`SELECT 
            ${phoneNumberModel.id} as phone_no_id,
            ${userModel.id} as reg_user_id,
            ${spamReportsModel.id} as spam_report_id,
            ${spamReportsModel.name} as spam_report_name,
            ${userModel.name} as reg_user_name
        FROM ${phoneNumberModel}
            LEFT JOIN ${userModel}
                ON ${phoneNumberModel.contactOfUserId} = ${userModel.id}     
            LEFT JOIN ${spamReportsModel} 
                ON ${spamReportsModel.phoneNumberId} = ${phoneNumberModel.id}
            WHERE 
                (LOWER(${spamReportsModel.name}) LIKE ${like}
                    OR LOWER(${userModel.name}) LIKE ${like})
        `;
    const result1 = await db.execute(sql1);
    return result1;
}


