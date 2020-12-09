import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Ajv from 'ajv';
import { v4 as generateUuid } from 'uuid';
import db from '../db';
import log from '../logger';
import { wrapAsync } from '../common';
import { validateSession } from './accounts';

let router = express.Router(); // eslint-disable-line new-cap
let jsonParse = bodyParser.json();
let cookieParse = cookieParser();
let ajv = new Ajv();

router.use(jsonParse);
router.use(cookieParse);

router.get('/', (_req, res) => res.send({ status: 'ok' }));

router.get('/users/all', wrapAsync(async (req, res) => {
  let lots = await db.query('SELECT accounts.userId, accounts.firstName, accounts.lastName, accounts.email, lotoccupancy.plateid, lotOccupancy.lotid FROM lotOccupancy JOIN vehicles ON lotoccupancy.plateid = vehicles.plateid JOIN accounts ON vehicles.userid = accounts.userid');

  //trying to send all lots at once
  res.status(200).send({
    lots: lots.rows
  });
}));

// Return list of plate IDs from 
router.get('/lots/all', wrapAsync(async (req, res) => {
  let lots = await db.query('SELECT lotId, plateId FROM lotOccupancy ORDER BY lotId');

  //trying to send all lots at once
  res.status(200).send({
    lots: lots.rows
  });
}));

router.get('/lots/current', validateSession, wrapAsync(async (req, res) => {
  if (!req.session) {
    res.status(404).send({
      status: 'error',
      error: 'NO_SESSION',
      description: 'session does not exist'
    });
    return;
  }
  let lot = (await db.query('SELECT lotid, lotoccupancy.plateid FROM lotoccupancy LEFT JOIN vehicles ON lotoccupancy.plateid = vehicles.plateid WHERE userid = $1', [req.session.userId]));
  res.status(200).send({
    status: 'ok',
    lots: lot.rows
  });
}));

router.get('/users/:lotId', wrapAsync(async (req, res) => {
  let lotid = req.params.lotId;
  let users = await db.query('SELECT accounts.userId, accounts.firstName, accounts.lastName, accounts.email, lotoccupancy.plateid FROM lotOccupancy JOIN vehicles ON lotoccupancy.plateid = vehicles.plateid JOIN accounts ON vehicles.userid = accounts.userid WHERE lotOccupancy.lotid = $1', [lotid]);

  //trying to send all lots at once
  res.status(200).send({
    users: users.rows
  });
}));

// Return list of plate IDs from a single lot
router.get('/lots/:lotId', wrapAsync(async (req, res) => {
  let lotId = req.params.lotId;
  let query = await db.query('SELECT plateId FROM lotOccupancy WHERE lotId = $1', [lotId]);
  if (!query.rows.length) {
    res.status(404).send({
      status: 'error',
      error: 'LOT_NOT_FOUND',
      description: 'lot does not exist'
    });
    return;
  }
  //trying to send all vehicles at once
  res.status(200).send({
    status: 'ok',
    plates: query.rows
  });
}));

// Post yourself in current lot
router.post('/lots/:lotId/:plateId', wrapAsync(async (req, res) => {
  let lotId = req.params.lotId;
  let plateId = req.params.plateId;

  let result = await db.query('INSERT INTO lotOccupancy (lotId, plateId) ' +
    'VALUES ($1, $2) ON CONFLICT DO NOTHING', [lotId, plateId]);
  if (!result.rowCount) {
    res.status(409).send({
      status: 'error',
      error: 'LOT_EXISTS',
      description: 'Specific lotId and plateId already exists (i.e., user is already parked)'
    });
  } else {
    res.status(200).send({
      status: 'ok',
      lotId: lotId,
      plateId: plateId
    });
  }
}));

// Delete yourself in current lot
router.delete('/lots/:lotId/:plateId', wrapAsync(async (req, res) => {
  let lotId = req.params.lotId;
  let plateId = req.params.plateId;

  let result = await db.query('DELETE FROM lotOccupancy ' +
    'WHERE lotId = $1' +
    'AND plateId = $2', [lotId, plateId]);
  if (!result.rowCount) {
    res.status(409).send({
      status: 'error',
      error: 'DOES_NOT_EXIST',
      description: 'Combination does not exist (i.e., lot is not present, or the user is not parked here)'
    });
  } else {
    res.status(200).send({
      status: 'ok'
    });
  }
}));
export default router;
