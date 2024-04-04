import { index, pgTable, serial, text } from 'drizzle-orm/pg-core';

const model  = pgTable('sns-user', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
}, (table)=>{
    return {
        emailIdx: index('emailIdx').on(table.email),
    };
});

export default model;