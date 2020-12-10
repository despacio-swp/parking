import express from 'express';
import { wrapAsync as wrap } from './common';
import accountsRouter from './api/accounts';
import lotsRouter from './api/parkingLots';
import protestsRouter from './api/protests';
import linksRouter from './api/links';
import profilesRouter from './api/profiles';
import presenceRouter from './api/presence';
import vehicleRouter from './api/vehicles';

let router = express.Router(); // eslint-disable-line new-cap

router.get('/v1', wrap(async (req, res) => {
  res.send({ status: 'ok' });
}));

router.use('/v1/accounts', accountsRouter);
router.use('/v1/lots', lotsRouter);
router.use('/v1/protests', protestsRouter);
router.use('/v1/links',  linksRouter);
router.use('/v1/profiles', profilesRouter);
router.use('/v1/presence', presenceRouter);
router.use('/v1/vehicles', vehicleRouter);

export default router;
