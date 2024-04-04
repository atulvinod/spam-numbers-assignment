import { Router } from 'express';
import jetValidator from 'jet-validator';

const apiRouter = Router(),
validate = jetValidator();

export default apiRouter;
