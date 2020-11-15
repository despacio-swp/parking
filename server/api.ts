import express from 'express';
import { wrapAsync as wrap } from './common';
import counterRouter from './api/counter';
import accountsRouter from './api/accounts';
import lotsRouter from './api/parkingLots';

let router = express.Router(); // eslint-disable-line new-cap

router.get('/v1', wrap(async (req, res) => {
  res.send({ status: 'ok' });
}));

router.use('/v1/counter', counterRouter);
router.use('/v1/accounts', accountsRouter);
router.use('/v1/parkingLots', lotsRouter)

export default router;
