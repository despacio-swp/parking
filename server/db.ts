import { Pool } from 'pg';
import log from './logger';

// uses environment variables for connection, see .env
const pool = new Pool();

pool.on('error', (err, _client) => {
  log.warning('database idle client had error', err);
});

export default pool;
