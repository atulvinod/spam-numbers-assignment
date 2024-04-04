/**
 * Setup express server.
 */

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';

import 'express-async-errors';

import baseRouter from '@src/routes/api';
import healthRouter from '@src/routes/health.route';
import userRouter from '@src/routes/user.route';

import paths from '@src/constants/paths';

import envVars from '@src/constants/envVars';
import httpStatusCodes from '@src/constants/httpStatusCodes';

import { nodeEnvs } from '@src/constants/misc';
import { ApplicationError, RouteError } from '@src/other/classes';
import { createRoute } from './util/misc';

// **** Variables **** //

const app = express();

// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(envVars.cookieProps.secret));

// Show routes called in console during development
if (envVars.nodeEnv === nodeEnvs.Dev.valueOf()) {
    app.use(morgan('dev'));
}

// Security
if (envVars.nodeEnv === nodeEnvs.Production.valueOf()) {
    app.use(helmet());
}

// Add APIs, must be after middleware
app.use(paths.base, baseRouter);
app.use(createRoute(paths.healthCheck), healthRouter);
app.use(createRoute(paths.users), userRouter);
// Add error handler
app.use(
    (
        err: Error,
        _: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: NextFunction,
    ) => {
        if (err instanceof RouteError) {
            return res.status(err.status ??
                httpStatusCodes.INTERNAL_SERVER_ERROR).json({
                error: err.message ??
                    'Internal Server Error',
            });
        }
        if (err instanceof ApplicationError) {
            return res.status(err.routeError?.status ??
                    httpStatusCodes.INTERNAL_SERVER_ERROR).json({
                error: err.message ??
                        'Internal Server Error',
            });
        }
                
        logger.err(err, true);
        
        return res.status("status" in err ? (err.status as number)  : httpStatusCodes.INTERNAL_SERVER_ERROR)
            .json({ 'error': 
            "status" in err ? err.message ??  
            `Unexpected internal server error occurred, We are working on fixing it` :
            `Unexpected internal server error occurred,  We are working on fixing it` });
    },
);

// ** Front-End Content ** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

export default app;
