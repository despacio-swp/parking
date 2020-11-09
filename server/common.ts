import express from 'express';
import { randomBytes } from 'crypto';

/**
 * Wraps an async function handler
 * @param fn
 * @return
 */
export function wrapAsync(fn: express.RequestHandler): express.RequestHandler {
  return (req, res, next) => fn(req, res, next).catch(next);
}

export function generateToken() {
  return randomBytes(24).toString('base64');
}
