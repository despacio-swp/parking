import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Ajv from 'ajv';
import { v4 as generateUuid } from 'uuid';
import db from '../db';
import log from '../logger';
import { wrapAsync} from '../common';


let router = express.Router(); // eslint-disable-line new-cap
let jsonParse = bodyParser.json();
let cookieParse = cookieParser();
let ajv = new Ajv();

router.use(jsonParse);
router.use(cookieParse);

router.get('/', (_req, res) => res.send({ status: 'ok' }));

// TODO: use ajv more

/**
 * Validate a session
 * @param req
 * @param res
 */
async function validateSession(req: express.Request, res: express.Response):
Promise<{ userId: string, token: string} | null> {
  let sessionToken: string | undefined = req.cookies.session;
  if (!sessionToken) {
    log.verbose('authenticated endpoint called without session');
    res.status(401).send({
      status: 'error',
      error: 'NO_SESSION',
      description: 'no session exists'
    });
    return null;
  }

  let session = (await db.query(
    'SELECT userId, expires FROM sessions WHERE token = $1',
    [sessionToken]
  )).rows[0];
  if (!session) {
    log.verbose('session not found');
    res.status(401).send({
      status: 'error',
      error: 'INVALID_SESSION',
      description: 'provided session does not exist'
    });
    return null;
  }
  if (session.expires && +session.expires < Date.now()) {
    log.verbose('session expired');
    res.status(401).send({
      status: 'error',
      error: 'INVALID_SESSION',
      description: 'provided session does not exist'
    });
    await db.query('DELETE FROM sessions WHERE token = $1', [sessionToken]);
    return null;
  }

  return {
    userId: session.userId,
    token: sessionToken
  };
}

/*
  GET REQUEST
*/

router.get('/:lotId', wrapAsync(async (req, res) => {
  let session = await validateSession(req, res);
  if (!session) return;

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
  PUT REQUEST
*/
// ask how to deal w parameters that could be null
router.put('/:lotId', wrapAsync(async (req, res) => {
  let session = await validateSession(req, res);
  if (!session) return;

  let lotId = req.params.lotId;
  let userId = req.params.userId;
  let capacity = req.params.capacity;
  let lotAddress = req.params.lotAddress;
  let pricePerHour = req.params.pricePerHour;
  // possible null parameters
  let lotDescription = req.params.lotDescription;
  let tags = req.params.tags;

  let lot = (await db.query('UPDATE parkingLots SET userId = $2, capacity = $3, lotAddress = $4, pricePerHour = $5, lotDescription = $6, tags = $7 WHERE lotId = $1 ' +
    'ON CONFLICT DO NOTHING', [lotId,userId,capacity,lotAddress,pricePerHour,lotDescription,tags]));
  
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

let registerSchema = ajv.compile({
  type: 'object',
  properties: {
    capacity: { type: 'integer' },
    lotAddress: { type: 'string' },
    pricePerHour: {type: 'number'},
    lotDescription: {type: 'string'}
  },
  required: ['capacity', 'lotAddress', 'pricePerHour']
});

/*
  POST REQUEST
*/
router.post('/lot', wrapAsync(async (req, res) => {
  if (!registerSchema(req.body)) {
    res.status(400).send({
      status: 'error',
      error: 'VALIDATION_FAILED',
      details: registerSchema.errors
    });
    return;
  }
  

  let lotId = generateUuid();

  let lotDescription = req.body.lotDescription;
  let tags = req.body.tags;

  let { capacity, lotAddress, pricePerHour} = req.body;
  
  // TODO: do a select here first to avoid expensive hash if account already exists
  let result = await db.query('INSERT INTO parkingLots (lotId, userId, capacity, lotAddress, pricePerHour, lotDescription) ' +
    'VALUES ($1,\'a1ba09ca-ea36-4d6d-9f90-fe370d1970d9\', $2, $3, $4, $5) ON CONFLICT DO NOTHING', [lotId, capacity, lotAddress, pricePerHour, lotDescription]);
  
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
      lotAddress: lotAddress,
      pricePerHour: pricePerHour,
      lotDescription: lotDescription,
      tags: tags
    });
  }
}));

export default router;
