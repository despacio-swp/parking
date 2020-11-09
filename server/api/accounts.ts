import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import Ajv from 'ajv';
import { v4 as generateUuid } from 'uuid';
import db from '../db';
import log from '../logger';
import { wrapAsync, generateToken } from '../common';

const BCRYPT_SALT_ROUNDS = 10;

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
    userId: session.userid,
    token: sessionToken
  };
}

router.get('/session', wrapAsync(async (req, res) => {
  let session = await validateSession(req, res);
  if (!session) return;

  let user = (await db.query('SELECT firstname, lastname, email FROM accounts WHERE userid = $1', [session.userId])).rows[0];
  res.status(200).send({
    status: 'ok',
    userId: session.userId,
    firstName: user.firstname,
    lastName: user.lastname,
    email: user.email
  });
}));

router.post('/login', jsonParse, wrapAsync(async (req, res) => {
  if (!req.body.email || !req.body.password) {
    log.verbose('login request failed (bad request)');
    return res.status(400).send({
      status: 'error',
      error: 'BAD_REQUEST',
      description: 'required fields were not provided'
    });
  }

  let email = req.body.email.toLowerCase();

  log.debug('handle login request', { email });
  let user = (await db.query(
    'SELECT userid, password, firstname, lastname FROM accounts WHERE email = $1',
    [email]
  )).rows[0];
  if (!user) {
    log.verbose('login request failed (user not found)', { email });
    return res.status(401).send({
      status: 'error',
      error: 'INVALID_CREDENTIALS',
      description: 'username or password is incorrect'
    });
  }
  if (await bcrypt.compare(req.body.password, user.password)) {
    log.info('login request succeeded', { email, userId: user.userid });
    let sessionToken = generateToken();
    // TODO: session expiry, maybe?
    // let expires = new Date(Date.now() + config.SESSION_EXPIRY * 1000);
    let expires = null;
    await db.query(
      'INSERT INTO sessions (userid, token, expires) VALUES ($1, $2, $3)',
      [user.userid, sessionToken, expires]
    );
    res.cookie('session', sessionToken, {
      // maxAge: config.SESSION_EXPIRY * 1000
    });
    res.status(201).send({
      status: 'ok',
      userId: user.userid,
      expiry: expires ? +expires : null,
      token: sessionToken,
      firstName: user.firstname,
      lastName: user.lastname
    });
    // delete oldest session if above max session count, need not be awaited
    /* TODO:
    (async () => {
      let result = await db.query(
        'SELECT expires FROM sessions WHERE username = $1 ORDER BY expires DESC',
        [user.username]
      );
      if (result.rowCount > config.MAX_SESSIONS) {
        let target = result.rows[config.MAX_SESSIONS - 1].expires;
        target = new Date(Math.max(Date.now(), target));
        await db.query(
          'DELETE FROM sessions WHERE username = $1 AND expires < $2',
          [user.username, target]
        );
      }
    })();
    */
  } else {
    log.verbose('login request failed (bad password)', { email, userId: user.userid });
    return res.status(401).send({
      status: 'error',
      error: 'INVALID_CREDENTIALS',
      description: 'username or password is incorrect'
    });
  }
}));

router.post('/logout', wrapAsync(async (req, res) => {
  let sessionToken: string | undefined = req.cookies.session;
  if (!sessionToken) {
    log.verbose('logout called without session');
    return res.status(400).send({
      status: 'error',
      error: 'NO_SESSION',
      description: 'a session was not provided'
    });
  }
  let result = await db.query('DELETE FROM sessions WHERE token = $1', [sessionToken]);
  if (result.rowCount > 0) {
    log.verbose('logout successful');
    res.cookie('session', '');
    res.status(200).send({ status: 'ok' });
  } else {
    log.verbose('logout called with invalid session');
    res.status(404).send({
      status: 'error',
      error: 'INVALID_SESSION',
      description: 'provided session does not exist'
    });
  }
}));

let registerSchema = ajv.compile({
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' }
  },
  required: ['email', 'password', 'firstName', 'lastName']
});

router.post('/register', wrapAsync(async (req, res) => {
  if (!registerSchema(req.body)) {
    res.status(400).send({
      status: 'error',
      error: 'VALIDATION_FAILED',
      details: registerSchema.errors
    });
    return;
  }

  let userId = generateUuid();
  // TODO: verify emails are actually valid, http://emailregex.com
  let email = req.body.email.toLowerCase();
  let { password, firstName, lastName } = req.body;
  // TODO: do a select here first to avoid expensive hash if account already exists
  let hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  let result = await db.query('INSERT INTO accounts (userId, email, password, firstName, lastName, isLotOwner) ' +
    'VALUES ($1, $2, $3, $4, $5, FALSE) ON CONFLICT DO NOTHING', [userId, email, hashedPassword, firstName, lastName]);
  if (!result.rowCount) {
    res.status(409).send({
      status: 'error',
      error: 'ACCOUNT_EXISTS',
      description: 'account with the provided email already exists'
    });
  } else {
    res.status(200).send({
      status: 'ok',
      email,
      userId
    });
  }
}));

export default router;
