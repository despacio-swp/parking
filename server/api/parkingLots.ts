import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Ajv from 'ajv';
import { v4 as generateUuid } from 'uuid';
import db from '../db';
import { wrapAsync } from '../common';
import { validateSession } from './accounts';

let router = express.Router(); // eslint-disable-line new-cap
let jsonParse = bodyParser.json();
let cookieParse = cookieParser();
let ajv = new Ajv();

router.use(jsonParse);
router.use(cookieParse);

router.get('/', (_req, res) => res.send({ status: 'ok' }));

// TODO: use ajv more

/*
  GET REQUEST for All Lots
*/
router.get('/all', wrapAsync(async (req, res) => {
  let lots = await db.query('SELECT lotId, userId, capacity, lotAddress, pricePerHour, lotDescription FROM parkingLots');
  // send all lots at once
  res.status(200).send({
    lots: lots.rows
  });
}));

/*
  GET REQUEST
*/
router.get('/:lotId', wrapAsync(async (req, res) => {
  let lotId = req.params.lotId;

  let query = (await db.query('SELECT userId, capacity, lotAddress, pricePerHour, lotDescription FROM parkingLots WHERE lotId = $1', [lotId]));
  if (!query.rows.length) {
    res.status(404).send({
      status: 'error',
      error: 'LOT_NOT_FOUND',
      description: 'lot does not exist'
    });
    return;
  }
  let lot = query.rows[0];
  res.status(200).send({
    status: 'ok',
    userId: lot.userId,
    capacity: lot.capacity,
    lotAddress: lot.lotAddress,
    pricePerHour: lot.pricePerHour,
    lotDescription: lot.lotDescription
  });
}));

let createLotSchema = ajv.compile({
  type: 'object',
  properties: {
    capacity: { type: 'integer' },
    lotAddress: { type: 'string' },
    pricePerHour: { type: 'number' },
    lotDescription: { type: 'string' }
  },
  required: ['capacity', 'lotAddress', 'pricePerHour']
});

/*
  PUT REQUEST
*/
// ask how to deal w parameters that could be null
router.put('/:lotId', validateSession, wrapAsync(async (req, res) => {
  if (!req.session) {
    res.status(401).send({
      status: 'error',
      error: 'NOT_AUTHENTICATED',
      details: 'no session exists'
    });
    return;
  }

  if (!createLotSchema(req.body)) {
    res.status(400).send({
      status: 'error',
      error: 'VALIDATION_FAILED',
      details: createLotSchema.errors
    });
    return;
  }

  let lotId = req.params.lotId;
  let userId = req.session.userId;

  let capacity = req.body.capacity;
  let lotAddress = req.body.lotAddress;
  let pricePerHour = req.body.pricePerHour;
  // possible null parameters
  let lotDescription = req.body.lotDescription || null;

  let lot = (await db.query('UPDATE parkingLots SET capacity = $3, lotAddress = $4, pricePerHour = $5, lotDescription = $6 WHERE lotId = $1 AND userId = $2',
    [lotId, userId, capacity, lotAddress, pricePerHour, lotDescription]));

  res.status(200).send({
    status: 'ok',
    lotId: lotId,
    userId: userId,
    capacity: capacity,
    lotAddress: lotAddress,
    pricePerHour: pricePerHour,
    lotDescription: lotDescription
  });
}));

/*
  DELETE Request
*/
router.delete('/:lotId', validateSession, wrapAsync(async (req, res) => {
  if (!req.session) {
    res.status(401).send({
      status: 'error',
      error: 'NOT_AUTHENTICATED',
      details: 'no session exists'
    });
    return;
  }

  let lotId = req.params.lotId;
  let userId = req.session.userId;

  let query = await db.query('DELETE FROM parkingLots WHERE lotId = $1 AND userId = $2', [lotId, userId]);
  if (!query.rowCount) {
    res.status(404).send({
      status: 'error',
      error: 'NONEXISTENT_LOT',
      description: 'lot does not exist'
    });
  } else {
    res.status(200).send({ status: 'ok' });
  }
}));

/*
  POST REQUEST
*/
router.post('/lot', validateSession, wrapAsync(async (req, res) => {
  if (!req.session) {
    res.status(401).send({
      status: 'error',
      error: 'NOT_AUTHENTICATED',
      details: 'no session exists'
    });
    return;
  }
  if (!createLotSchema(req.body)) {
    res.status(400).send({
      status: 'error',
      error: 'VALIDATION_FAILED',
      details: createLotSchema.errors
    });
    return;
  }

  let lotId = generateUuid();

  let lotDescription = req.body.lotDescription;
  let userId = req.session.userId;

  let { capacity, lotAddress, pricePerHour } = req.body;
  // TODO: do a select here first to avoid expensive hash if account already exists
  let result = await db.query('INSERT INTO parkingLots (lotId, userId, capacity, lotAddress, pricePerHour, lotDescription) ' +
    'VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING', [lotId, userId, capacity, lotAddress, pricePerHour, lotDescription]);
  if (!result.rowCount) {
    res.status(409).send({
      status: 'error',
      error: 'LOT_EXISTS',
      description: 'lot with the provided lotAddress already exists'
    });
  } else {
    res.status(200).send({
      status: 'ok',
      lotId: lotId,
      userId: userId,
      capacity: capacity,
      lotAddress: lotAddress,
      pricePerHour: pricePerHour,
      lotDescription: lotDescription
    });
  }
}));

export default router;
