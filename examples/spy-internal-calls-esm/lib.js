import db from './db';

const keyPrefix = 'todos';
const makeKey = key => `${keyPrefix}:${key}`;

const lib = {
  // Could also define makeKey inline like so:
  // makeKey(key) { return `${keyPrefix}:${key}` },
  makeKey,
  getTodo(id) {
    return db.get(lib.makeKey(id));
  }
};

export default lib;
