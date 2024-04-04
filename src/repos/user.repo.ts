import db from '@src/lib/database';
import user from '@src/models/user.model';
import { ApplicationError, RouteError } from '@src/other/classes';
import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt';
import HttpStatusCodes from '@src/constants/httpStatusCodes';

const errors = {
    USER_ALREADY_EXISTS: new ApplicationError('User already exists',
        {routeError: 
            new RouteError(HttpStatusCodes.CONFLICT, 'User already exists'),
        }),
};

export async function findById(id: number) {
    const [result] = await db.select()
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
}) {
    const existing = await findByEmail(obj.email);
    if (existing) {
        throw errors.USER_ALREADY_EXISTS;
    }

    const hashedPassword = await hash(obj.password, 10);
    const insertValue: typeof user.$inferInsert = {
        name: obj.name,
        email: obj.email,
        password: hashedPassword,
    };
    
    const [result] = await db.insert(user)
        .values(insertValue)
        .returning({insertedId: user.id});
    return {id: result.insertedId, email: obj.email, name:obj.name};
}
