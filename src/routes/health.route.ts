import { Router } from 'express';
import * as healthService from '@src/services/health.service';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        await healthService.healthCheck();
        return res.json({ message: 'running' });
    } catch (error) {
        next(error);
    }
});

export default router;
