import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Ajv from 'ajv';
import { v4 as generateUuid } from 'uuid';
import db from '../db';
import { wrapAsync } from '../common';
import { validateSession } from './accounts';
import { LogEntry } from 'winston';
import got from 'got';
import { stringify } from 'querystring';

let router = express.Router(); // eslint-disable-line new-cap
let jsonParse = bodyParser.json();
let cookieParse = cookieParser();
let ajv = new Ajv();

router.use(jsonParse);
router.use(cookieParse);

router.get('/', (_req, res) => res.send({ status: 'ok' }));


/*
    GET REQUEST for distance between lot and protest, given by respective IDs
*/
router.get('lot/:lotId/protest/:protestId', wrapAsync(async (req, res) => {


  let lotId = req.params.lotId;
  let protestId  = req.params.protestId;

  let query = (await db.query('SELECT lotAddress FROM parkingLots WHERE lotId = $1', [lotId]));
  
  if (!query.rows.length) {
    res.status(404).send({
      status: 'error',
      error: 'LOT_NOT_FOUND',
      description: 'lot with specified lotId does not exist'
    });
    return;
  }

  let lot = query.rows[0];

  query = (await db.query('SELECT protestAddress FROM protests WHERE protestId = $1', [protestId]));
  
  if (!query.rows.length) {
    res.status(404).send({
      status: 'error',
      error: 'PROTEST_NOT_FOUND',
      description: 'protest with specified protestId does not exist'
    });
    return;
  }

  let protest = query.rows[0];

  let lotAddress = lot.lotAddress;
  let protestAddress = protest.protestAddress;
  //prepare string for api call
  let originString  = lotAddress.replace(/ /g, "+");
  let destinationString = protestAddress.replace(/ /g, "+");
  let apiKey = "AIzaSyB_re34N4oZy_QKQsq7wQCfAhtOxU8uvLc";


  let call = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + originString + 
              '&destinations=' + destinationString + '&key=' + apiKey;

  /*
    // this is an arbitrary calculated value by google,
      using for purposes of "less than greater than" so its ok
      - Anurag
  */

  (async () => {
    const response = await got.get(call);
    let responseB = JSON.parse(response.body);
    let distance = responseB.rows[0].elements[0].distance.value;

    res.status(200).send({
        distance:  distance
    });

  })();
  
}));

export default router;
