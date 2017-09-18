import express from 'express';

import NotifyPayFeeRouter from './Cronjob/NotifyPayFeeRouter';

const router = express.Router();

router.get('/reminder-to-pay-fee', NotifyPayFeeRouter(router));

export default router;
