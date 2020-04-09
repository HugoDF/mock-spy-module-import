import db from './db';

const keyPrefix = 'todos';
export const makeKey = (key) => `${keyPrefix}:${key}`;

export function getTodo(id) {
  return db.get(makeKey(id));
}
