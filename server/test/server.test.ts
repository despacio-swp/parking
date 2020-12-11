require('dotenv').config(); // eslint-disable-line @typescript-eslint/no-var-requires
import api from '../api';
import express from 'express';
import morgan from 'morgan';
import log from '../logger';
import request from 'supertest';
import { assert } from 'console';

// set up application and mount api
let app = express();

let logger = morgan('combined', {
  stream: {
    write(line) {
      log.info(line.replace(/\n$/g, ''));
    }
  }
});
app.use(logger);

app.use('/api', api);

let server = app.listen();
let agent = request.agent(server);

const TEST_USER_INFO = {
  email: 'testuser@example.com',
  password: 'testpassword',
  firstName: 'Testing',
  lastName: 'User'
};

beforeAll(async () => {
  // ensure account is set up
  await agent.post('/api/v1/accounts/register')
    .send(TEST_USER_INFO)
    .expect(res => {
      assert(res.status === 201 || res.status === 409);
    });

  // try login
  await agent.post('/api/v1/accounts/login')
    .send({
      email: TEST_USER_INFO.email,
      password: TEST_USER_INFO.password
    })
    .expect(201);
});

afterAll(async () => {
  await agent.post('/api/v1/accounts/logout').expect(200);
  server.close();
});

describe('accounts api', () => {
  test('endpoint /accounts/session', async () => {
    let response = await agent.get('/api/v1/accounts/session')
      .expect(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.email).toBe(TEST_USER_INFO.email);
    expect(response.body.firstName).toBe(TEST_USER_INFO.firstName);
    expect(response.body.lastName).toBe(TEST_USER_INFO.lastName);
  });
});

describe('lots api', () => {
  let lotId: string | null = null;
  test('add lot', async () => {
    let response = await agent.post('/api/v1/lots/lot')
      .send({
        capacity: 100,
        lotAddress: 'test address',
        pricePerHour: 4,
        lotDescription: 'test description'
      })
      .expect(200);
    expect(response.body.lotId).toBeDefined();
    lotId = response.body.lotId;
    expect(response.body.capacity).toBe(100);
    expect(response.body.lotAddress).toBe('test address');
    expect(response.body.pricePerHour).toBe(4);
    expect(response.body.lotDescription).toBe('test description');
  });
  test('check all lots', async () => {
    let response = await agent.get('/api/v1/lots/all')
      .expect(200);
    expect(response.body.lots).toBeDefined();
    expect(response.body.lots.find((lot: any) => lot.lotid === lotId)).not.toBeUndefined();
  });
  test('check own lots', async () => {
    let response = await agent.get('/api/v1/lots/self')
      .expect(200);
    expect(response.body.lots).toBeDefined();
    expect(response.body.lots.find((lot: any) => lot.lotid === lotId)).not.toBeUndefined();
  });
  test('check autocomplete by name', async () => {
    let response = await agent.get('/api/v1/lots/autocomplete')
      .query({ query: 'test description' })
      .expect(200);
    expect(response.body.find((lot: any) => lot.lotId === lotId)).not.toBeUndefined();
  });
  test('check autocomplete by address', async () => {
    let response = await agent.get('/api/v1/lots/autocomplete')
      .query({ query: 'test address' })
      .expect(200);
    expect(response.body.find((lot: any) => lot.lotId === lotId)).not.toBeUndefined();
  });
  test('edit lot', async () => {
    let response = await agent.put('/api/v1/lots/' + lotId)
      .send({
        capacity: 500,
        lotAddress: 'test address 2',
        pricePerHour: 5,
        lotDescription: 'test description 2'
      })
      .expect(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.lotId).toBe(lotId);
    expect(response.body.capacity).toBe(500);
    expect(response.body.lotAddress).toBe('test address 2');
    expect(response.body.pricePerHour).toBe(5);
    expect(response.body.lotDescription).toBe('test description 2');

    response = await agent.get('/api/v1/lots/all')
      .expect(200);
    expect(response.body.lots).toBeDefined();
    let lot = response.body.lots.find((lot: any) => lot.lotid === lotId);
    expect(lot).not.toBeNull();
    expect(lot.capacity).toBe(500);
    expect(lot.lotaddress).toBe('test address 2');
    expect(lot.priceperhour).toBe('5');
    expect(lot.lotdescription).toBe('test description 2');
  });
  test('delete lot', async () => {
    await agent.delete('/api/v1/lots/' + lotId)
      .expect(200, { status: 'ok' });

    let response = await agent.get('/api/v1/lots/all')
      .expect(200);
    expect(response.body.lots).toBeDefined();
    expect(response.body.lots.find((lot: any) => lot.lotid === lotId)).toBeUndefined();
  });
});

describe('protests api', () => {
  let protestId: string | null = null;
  test('add protest', async () => {
    let response = await agent.post('/api/v1/protests/protest')
      .send({
        protestDate: 'sometime',
        protestName: 'test protest',
        protestAddress: 'test address',
        protestDescription: 'test description',
        email: 'testing@example.com'
      })
      .expect(200);
    expect(response.body.protestId).toBeDefined();
    protestId = response.body.protestId;
    expect(response.body.protestDate).toBe('sometime');
    expect(response.body.protestName).toBe('test protest');
    expect(response.body.protestAddress).toBe('test address');
    expect(response.body.protestDescription).toBe('test description');
    expect(response.body.email).toBe('testing@example.com');
  });
  test('check all protests', async () => {
    let response = await agent.get('/api/v1/protests/all')
      .expect(200);
    expect(response.body.protests).toBeDefined();
    expect(response.body.protests.find((protest: any) => protest.protestid === protestId)).not.toBeUndefined();
  });
  test('check own protests', async () => {
    let response = await agent.get('/api/v1/protests/self')
      .expect(200);
    expect(response.body.protests).toBeDefined();
    expect(response.body.protests.find((protest: any) => protest.protestid === protestId)).not.toBeUndefined();
  });
  test('edit protest', async () => {
    let response = await agent.put('/api/v1/protests/' + protestId)
      .send({
        protestDate: 'other time',
        protestName: 'test protest 2',
        protestAddress: 'test address 2',
        protestDescription: 'test description 2',
        email: 'testing2@example.com'
      })
      .expect(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.protestDate).toBe('other time');
    expect(response.body.protestName).toBe('test protest 2');
    expect(response.body.protestAddress).toBe('test address 2');
    expect(response.body.protestDescription).toBe('test description 2');
    expect(response.body.email).toBe('testing2@example.com');

    response = await agent.get('/api/v1/protests/all')
      .expect(200);
    expect(response.body.protests).toBeDefined();
    let protest = response.body.protests.find((protest: any) => protest.protestid === protestId);
    expect(protest).not.toBeNull();
    expect(protest.protestdate).toBe('other time');
    expect(protest.protestname).toBe('test protest 2');
    expect(protest.protestaddress).toBe('test address 2');
    expect(protest.protestdescription).toBe('test description 2');
    expect(protest.email).toBe('testing2@example.com');
  });
  test('delete protest', async () => {
    await agent.delete('/api/v1/protests/' + protestId)
      .expect(200, { status: 'ok' });

    let response = await agent.get('/api/v1/protests/all')
      .expect(200);
    expect(response.body.protests).toBeDefined();
    expect(response.body.protests.find((protest: any) => protest.protestid === protestId)).toBeUndefined();
  });
});
