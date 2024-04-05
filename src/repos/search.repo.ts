import db from '@src/lib/database';
import { sql } from "drizzle-orm";

export async function getPersonsByName(name: string) {
    // join three tables to get the full name,
    const sql1 = sql`SELECT 
            n.id as phone_no_id,
            u.id as reg_user_id,
            r.id as spam_report_id,
            r.name as spam_report_name,
            u.name as reg_user_name,
        FROM sns-phone-numbers as n
            LEFT JOIN sns-users as u 
                ON n.contact_of_user_id = u.id     
            LEFT JOIN sns-spam-reports as r 
                ON r.phone_number_id = n.id
            WHERE 
                (LOWER(u.name) LIKE '${name.toLowerCase()}%'
                    OR LOWER(r.name) LIKE '${name.toLowerCase()}%')
        `;

    const result1 = await db.execute(sql1);
    return result1;
}


