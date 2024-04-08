import { Strategy as JwtStrategy } from 'passport-jwt'; 
import {ExtractJwt} from 'passport-jwt';
import envVars from '@src/constants/envVars';
import passport from 'passport';
import * as userService from '@src/services/user.service';
import { RouteError } from "@src/other/classes";
import HttpStatusCodes from "@src/constants/httpStatusCodes";

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: envVars.jwt.secret,
    issuer: envVars.jwt.issuer,
    audience: envVars.jwt.audience,
};

passport.use(
    new JwtStrategy(
        opts,
        async (
            jwt_payload: { phoneNumber: string; countryCode: string },
            done,
        ) => {
            try {
                const user = await userService.getUserByPhoneNumber(
                    jwt_payload.phoneNumber,
                    jwt_payload.countryCode,
                );
                if (user.isRegisteredUser) {
                    done(null, user);
                } else {
                    done(
                        new RouteError(
                            HttpStatusCodes.UNAUTHORIZED,
                            "Unauthorized token",
                        ),
                        false,
                    );
                }
            } catch (error) {
                done(
                    new RouteError(
                        HttpStatusCodes.UNAUTHORIZED,
                        "Unauthorized token",
                    ),
                    false,
                );
            }
        },
    ),
);

const auth  = passport.authenticate("jwt", { session: false });
export default auth;