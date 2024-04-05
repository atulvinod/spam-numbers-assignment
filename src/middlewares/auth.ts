import { Strategy as JwtStrategy } from 'passport-jwt'; 
import {ExtractJwt} from 'passport-jwt';
import envVars from '@src/constants/envVars';
import passport from 'passport';
import * as userService from '@src/services/user.service';


const opts =  {
    jwtFromRequest:  ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : envVars.jwt.secret,
    issuer: envVars.jwt.issuer,
    audience: envVars.jwt.audience,
};

passport.use(new JwtStrategy(opts, async (jwt_payload : {id: number}, done)=>{
    try{
        const user = await userService.getUserById(jwt_payload.id);
        done(null, user);
    }catch(error){
        done(error, false);
    }
}));

const auth  = passport.authenticate("jwt", { session: false });
export default auth;