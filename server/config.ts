// @ts-check
import { URL } from 'url';
const env = process.env;

/**
 * Define a required configuration parameter
 * @param name Configuration value name
 * @return
 */
function required(name: string): string {
  let value = env[name];
  if (typeof value === 'undefined') {
    throw new Error(`required value ${name} not provided`);
  }
  return value;
}

export const BASE_URL = new URL(required('BASE_URL'));
export const API_BASE_URL = new URL(required('API_BASE_URL'));
export const PORT = +required('PORT');
export const TLS = env.TLS === 'true';
export const TLS_CERT = TLS ? required('TLS_CERT') : null;
export const TLS_KEY = TLS ? required('TLS_KEY') : null;
