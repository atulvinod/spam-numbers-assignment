import { Router } from 'express';
import HttpStatusCodes from '@src/constants/httpStatusCodes';
import * as userService from '@src/services/user.service';
import {
    isCountryCode,
    isEmail,
    isPhone,
    routeErrorHandler,
} from '@src/util/misc';
import jetValidator from 'jet-validator';
const validate = jetValidator();
const api = Router();

api.post(
    '/',
    validate(
        'email',
        'name',
        'countryCode',
        'password',
        ['email', isEmail],
        ['phone', isPhone],
        ['countryCode', isCountryCode],
    ),
    async (req, res, next) => {
        try {
            const { email, name, password, countryCode, phone } = req.body;
            const createdUser = await userService.createUser({
                name,
                email,
                password,
            });
            const token = userService.generateToken(
                createdUser.id,
                createdUser.name,
                createdUser.email,
            );
            return res.status(HttpStatusCodes.CREATED).json({
                message: 'created',
                data: { user: createdUser, token },
            });
        } catch (error) {
            routeErrorHandler(error as Error, next);
        }
    },
);

api.post('/login', validate('email','password'), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const token = await userService.authenticateLogin(email, password);
        return res.json({ data: { token } });
    } catch (error) {
        routeErrorHandler(error as Error, next);
    }
});

export default api;
