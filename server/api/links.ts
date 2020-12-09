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
  GET REQUEST for All Links
*/
router.get('/all', wrapAsync(async (req, res) => {
  let links = await db.query('SELECT linkId, protestId, lotId FROM links');
  
  //trying to send all links at once
  res.status(200).send({
    links: links.rows
  });
}));

/*
  GET REQUEST
*/
router.get('/:linkId', wrapAsync(async (req, res) => {
  let linkId = req.params.linkId;

  let query = (await db.query('SELECT protestId, lotId FROM links WHERE linkId = $1', [linkId]));
  if (!query.rows.length) {
    res.status(404).send({
      status: 'error',
      error: 'LINK_NOT_FOUND',
      description: 'link does not exist'
    });
    return;
  }
  let link = query.rows[0];
  res.status(200).send({
    status: 'ok',
    linkId: linkId,
    protestId: link.protestId,
    lotId: link.lotId
  });
}));

/*
  PUT REQUEST
*/
// ask how to deal w parameters that could be null
router.put('/:linkId', wrapAsync(async (req, res) => {
  let linkId = req.params.linkId;
  let protestId = req.params.protestId;
  let lotId = req.params.lotId;

  let link = (await db.query('UPDATE links SET protestId = $2, lotId = $3 WHERE linkId = $1 ' +
    'ON CONFLICT DO NOTHING', [linkId, protestId, lotId]));
  
  res.status(200).send({
    status: 'ok',
    linkId: linkId,
    protestId: protestId,
    lotId: lotId
  });
}));

let createLinkSchema = ajv.compile({
  type: 'object',
  properties: {
    protestId: { type: 'string' },
    lotId: { type: 'string' }
  },
  required: ['protestId', 'lotId']
});

/*
  DELETE Request
*/
router.delete('/:linkId', validateSession, wrapAsync(async (req, res) => {
  

  let lotId = req.params.lotId;

  let query = await db.query('DELETE FROM links WHERE linkId = $1', [lotId]);
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
router.post('/link', validateSession, wrapAsync(async (req, res) => {
  
  if (!createLinkSchema(req.body)) {
    res.status(400).send({
      status: 'error',
      error: 'VALIDATION_FAILED',
      details: createLinkSchema.errors
    });
    return;
  }

  let linkId = generateUuid();


  let { protestId, lotId } = req.body;
  // TODO: do a select here first to avoid expensive hash if account already exists
  let result = await db.query('INSERT INTO links (linkId, protestId, lotId) ' +
    'VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [linkId, protestId, lotId]);
  if (!result.rowCount) {
    res.status(409).send({
      status: 'error',
      error: 'LINK_EXISTS',
      description: 'link with the provided linkId already exists'
    });
  } else {
    res.status(200).send({
      status: 'ok',
      linkId: linkId,
      protestId: protestId,
      lotId: lotId
    });
  }
}));

export default router;
