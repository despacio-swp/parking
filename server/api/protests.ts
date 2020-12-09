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
	  GET REQUEST for All Protests
	*/
	router.get('/all', wrapAsync(async (req, res) => {
	  let protests = await db.query('SELECT protestId, protestDate, protestName, email, protestAddress, protestDescription FROM protests');
	  
	  //trying to send all protests at once
	  res.status(200).send({
	    protests: protests.rows
	  });
	}));


/*
  GET REQUEST
*/

router.get('/:protestId', wrapAsync(async (req, res) => {
  let protestId = req.params.protestId;

  let query = (await db.query('SELECT userId, protestDate, protestName, email, protestAddress, protestDescription FROM protests WHERE protestId = $1', [protestId]));
  if (!query.rows.length) {
    res.status(404).send({
      status: 'error',
      error: 'PROTEST_NOT_FOUND',
      description: 'protest does not exist'
    });
    return;
  }
  let protest = query.rows[0];
  res.status(200).send({
    status: 'ok',
    userId: protest.userId,
    protestDate: protest.protestDate,
    protestName: protest.protestName,
    email: protest.email,
    protestAddress: protest.protestAddress,
    protestDescription: protest.protestDescription
  });
}));

let createProtestSchema = ajv.compile({
  type: 'object',
  properties: {
    protestDate: { type: 'string' },
    protestName: {type: 'string'},
    email: {type: 'string'},
    protestAddress: { type: 'string' },
    protestDescription: {type: 'string'}
  },
  required: ['protestDate', 'protestName', 'email','protestAddress']
});

/*
  PUT REQUEST
*/
// ask how to deal w parameters that could be null
router.put('/:protestId',validateSession, wrapAsync(async (req, res) => {

  if (!req.session) {
    res.status(401).send({
      status: 'error',
      error: 'NOT_AUTHENTICATED',
      details: 'no session exists'
    });
    return;
  }

  if (!createProtestSchema(req.body)) {
    res.status(400).send({
      status: 'error',
      error: 'VALIDATION_FAILED',
      details: createProtestSchema.errors
    });
    return;
  }

  let protestId = req.params.protestId;
  let userId = req.session.userId;

  let protestDate = req.body.protestDate;
  let protestName = req.body.protestName;
  let email = req.body.email;
  let protestAddress = req.body.protestAddress;
  // possible null parameters
  let protestDescription = req.body.protestDescription;

  let protest = (await db.query('UPDATE protests SET protestDate = $3, protestName = $4, email = $5, protestAddress = $6, protestDescription = $7 WHERE protestId = $1 AND userId = $2' , 
  [protestId,userId,protestDate,protestName,email, protestAddress,protestDescription]));
  
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



/*
  DELETE Request
*/
router.delete('/:protestId', validateSession, wrapAsync(async (req, res) => {
  if (!req.session) {
    res.status(401).send({
      status: 'error',
      error: 'NOT_AUTHENTICATED',
      details: 'no session exists'
    });
    return;
  }

  let protestId = req.params.protestId;
  let userId = req.session.userId;

  let query = await db.query('DELETE FROM protests WHERE protestId = $1 AND userId = $2', [protestId, userId]);
  if (!query.rowCount) {
    res.status(404).send({
      status: 'error',
      error: 'NONEXISTENT_PROTEST',
      description: 'protest does not exist'
    });
  } else {
    res.status(200).send({ status: 'ok' });
  }
}));

/*
  POST REQUEST
*/
router.post('/protest', validateSession, wrapAsync(async (req, res) => {
  if (!req.session) {
    res.status(401).send({
      status: 'error',
      error: 'NOT_AUTHENTICATED',
      details: 'no session exists'
    });
    return;
  }
  if (!createProtestSchema(req.body)) {
    res.status(400).send({
      status: 'error',
      error: 'VALIDATION_FAILED',
      details: createProtestSchema.errors
    });
    return;
  }

  let protestId = generateUuid();

  let userId = req.session.userId;
  

  let {protestDate, protestName, email, protestAddress, protestDescription} = req.body;
  
  let result = await db.query('INSERT INTO protests (protestId, userId, protestDate, protestName, email, protestAddress, protestDescription) ' +
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