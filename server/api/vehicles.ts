import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import db from '../db';
import { wrapAsync } from '../common';
import { validateSession } from './accounts';

let router = express.Router(); // eslint-disable-line new-cap
let jsonParse = bodyParser.json();
let cookieParse = cookieParser();

router.use(jsonParse);
router.use(cookieParse);

router.get('/', (_req, res) => res.send({ status: 'ok' }));

router.get('/user/self', validateSession, wrapAsync(async (req, res) => {
    if (!req.session) {
        res.status(404).send({
          status: 'error',
          error: 'NO_SESSION',
          description: 'session does not exist'
        });
        return;
      }
      let vehicles = (await db.query('SELECT plateid FROM vehicles WHERE userid = $1', [req.session.userId]));
      res.status(200).send({
        status: 'ok',
        vehicles: vehicles.rows
      });
  }));

  export default router;