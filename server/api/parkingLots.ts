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
  GET REQUEST
*/
router.get('/:lotId', wrapAsync(async (req, res) => {
  let lotId = req.params.lotId;

  let lot = (await db.query('SELECT userId, capacity, lotAddress, pricePerHour, lotDescription FROM parkingLots WHERE lotId = $1', [lotId])).rows[0];
  res.status(200).send({
    status: 'ok',
    userId: lot.userId,
    capacity: lot.capacity,
    lotAddress: lot.lotAddress,
    pricePerHour: lot.pricePerHour,
    lotDescription: lot.lotDescription
  });
}));


/*
  GET REQUEST for All Lots
*/
router.get('/:lots', wrapAsync(async (req, res) => {
  let lotId = req.params.lotId;

  let lots = await db.query('SELECT userId, capacity, lotAddress, pricePerHour, lotDescription FROM parkingLots');
  
  //trying to send all lots at once
  res.status(200).send({
    lots: lots.rows
  });
}));

/*
  PUT REQUEST
*/
// ask how to deal w parameters that could be null
router.put('/:lotId', wrapAsync(async (req, res) => {
  let lotId = req.params.lotId;
  let userId = req.params.userId;
  let capacity = req.params.capacity;
  let lotAddress = req.params.lotAddress;
  let pricePerHour = req.params.pricePerHour;
  // possible null parameters
  let lotDescription = req.params.lotDescription;
  let tags = req.params.tags;

  let lot = (await db.query('UPDATE parkingLots SET userId = $2, capacity = $3, lotAddress = $4, pricePerHour = $5, lotDescription = $6, tags = $7 WHERE lotId = $1 ' +
    'ON CONFLICT DO NOTHING', [lotId, userId, capacity, lotAddress, pricePerHour, lotDescription, tags]));
  
  res.status(200).send({
    status: 'ok',
    lotId: lotId,
    userId: userId,
    capacity: capacity,
    lotAddress: lotAddress,
    pricePerHour: pricePerHour,
    lotDescription: lotDescription,
    tags: tags
  });
}));

let createLotSchema = ajv.compile({
  type: 'object',
  properties: {
    capacity: { type: 'integer' },
    lotAddress: { type: 'string' },
    pricePerHour: { type: 'number' },
    lotDescription: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } }
  },
  required: ['capacity', 'lotAddress', 'pricePerHour']
});

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
  let tags = req.body.tags;
  if (!tags) tags = [];
  let userId = req.session.userId;

  let { capacity, lotAddress, pricePerHour } = req.body;
  // TODO: do a select here first to avoid expensive hash if account already exists
  let result = await db.query('INSERT INTO parkingLots (lotId, userId, capacity, lotAddress, pricePerHour, lotDescription, tags) ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING', [lotId, userId, capacity, lotAddress, pricePerHour, lotDescription, tags]);
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
      lotAddress: lotAddress,
      pricePerHour: pricePerHour,
      lotDescription: lotDescription,
      tags: tags
    });
  }
}));

export default router;
