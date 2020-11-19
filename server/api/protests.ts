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

router.get('/:protestId', wrapAsync(async (req, res) => {
  let session = await validateSession(req, res);
  if (!session) return;

  let protestId = req.params.protestId;

  let lot = (await db.query('SELECT userId, protestDate, protestName, email, protestAddress, protestDescription FROM protests WHERE protestId = $1', [protestId])).rows[0];
  res.status(200).send({
    status: 'ok',
    userId: lot.userId,
    protestDate: lot.protestDate,
    protestName: lot.protestName,
    email: lot.email,
    protestAddress: lot.protestAddress,
    protestDescription: lot.protestDescription
  });
}));

/*
  PUT REQUEST
*/
// ask how to deal w parameters that could be null
router.put('/:protestId', wrapAsync(async (req, res) => {
  let session = await validateSession(req, res);
  if (!session) return;

  let protestId = req.params.protestId;
  let userId = req.params.userId;
  let protestDate = req.params.protestDate;
  let protestName = req.params.protestName;
  let email = req.params.email;
  let protestAddress = req.params.protestAddress;
  // possible null parameters
  let protestDescription = req.params.protestDescription;

  let lot = (await db.query('UPDATE protests SET userId = $2, protestDate = $3, protestName = $4, email = $5, protestAddress = $6, protestDescription = $7 WHERE protestId = $1 ' +
    'ON CONFLICT DO NOTHING', [protestId,userId,protestDate,protestName,email, protestAddress,protestDescription]));
  
    res.status(200).send({
    status: 'ok',
    protestId: protestId,
    userId: userId,
    protestDate: protestDate,
    protestName: protestName,
    email: email,
    protestAddress: protestAddress,
    protestDescription: protestDescription
  });
}));

let registerSchema = ajv.compile({
  type: 'object',
  properties: {
    userId: {type: 'string'},
    protestDate: { type: 'string' },
    protestAddress: { type: 'string' },
    protestDescription: {type: 'string'}
  },
  required: ['userId','protestDate', 'protestAddress']
});

/*
  POST REQUEST
*/
router.post('/protest', wrapAsync(async (req, res) => {
  if (!registerSchema(req.body)) {
    res.status(400).send({
      status: 'error',
      error: 'VALIDATION_FAILED',
      details: registerSchema.errors
    });
    return;
  }

  let protestId = generateUuid();

  let userId = req.body.userId;
  

  let {protestDate, protestName, email, protestAddress, protestDescription} = req.body;
  
  let result = await db.query('INSERT INTO protests (protestId, userId, protestDate, protestAddress, protestDescription, tags) ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING', [protestId, userId, protestDate, protestName, email, protestAddress, protestDescription]);
  if (!result.rowCount) {
    res.status(409).send({
      status: 'error',
      error: 'PROTEST_EXISTS',
      description: 'protest with the provided protestAddress already exists'
    });
  } else {
    res.status(200).send({
      status: 'ok',
      protestId: protestId,
      userId: userId,
      protestDate: protestDate,
      protestName: protestName,
      email: email,
      protestAddress: protestAddress,
      protestDescription: protestDescription
    });
  }
}));

export default router;
