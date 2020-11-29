/* eslint-disable linebreak-style */
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { validateSession } from './accounts';
import { wrapAsync } from '../common';
import db from '../db';
import Ajv from 'ajv';

let router = express.Router(); // eslint-disable-line new-cap
let jsonParse = bodyParser.json();
let cookieParse = cookieParser();
let ajv = new Ajv();

router.use(jsonParse);
router.use(cookieParse);

router.get('/:userId', wrapAsync(async (req, res) => {
  let userQuery = await db.query('SELECT userId, firstName, lastName, email FROM accounts WHERE userId = $1', [req.params.userId]);
  if (!userQuery.rows.length) {
    res.status(404).send({
      status: 'error',
      error: 'NO_SUCH_USER',
      description: 'provided userId does not exist'
    });
    return;
  }
  let user = userQuery.rows[0];
  let vehiclesQuery = await db.query('SELECT plateId FROM vehicles WHERE userId = $1', [user.userId]);
  let vehicles = vehiclesQuery.rows.map(a => a.plateId);
  res.send({
    userId: user.userid,
    firstName: user.firstname,
    lastName: user.lastname,
    email: user.email,
    vehicles
  });
}));

let updateProfileSchema = ajv.compile({
  type: 'object',
  properties: {
    email: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' }
  },
  required: ['email', 'firstName', 'lastName']
});
router.post('/self', validateSession, wrapAsync(async (req, res) => {
  if (!req.session) {
    res.status(401).send({
      status: 'error',
      error: 'NOT_AUTHENTICATED',
      description: 'no session exists'
    });
    return;
  }
  if (!updateProfileSchema(req.body)) {
    res.status(400).send({
      status: 'error',
      error: 'VALIDATION_FAILED',
      details: updateProfileSchema.errors
    });
    return;
  }

  let userId = req.session.userId;
  let { firstName, lastName, email } = req.body;
  let userQuery = await db.query(
    'UPDATE accounts SET firstName = $2, lastName = $3, email = $4 WHERE userId = $1',
    [userId, firstName, lastName, email]
  );
  res.send({
    status: 'ok',
    firstName, lastName, email
  });
}));
export default router;
