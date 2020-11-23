import express from 'express';
import { wrapAsync as wrap } from './common';
import counterRouter from './api/counter';
import accountsRouter from './api/accounts';
import lotsRouter from './api/parkingLots';
import protestsRouter from './api/protests';
import profilesRouter from './api/profiles';

let router = express.Router(); // eslint-disable-line new-cap

router.get('/v1', wrap(async (req, res) => {
  res.send({ status: 'ok' });
}));

router.use('/v1/counter', counterRouter);
router.use('/v1/accounts', accountsRouter);
router.use('/v1/lots', lotsRouter);
router.use('/v1/protests', protestsRouter);
router.use('/v1/profiles', profilesRouter);

export default router;
