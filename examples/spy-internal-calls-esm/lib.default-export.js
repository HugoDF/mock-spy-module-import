import db from './db';

const keyPrefix = 'todos';
const makeKey = key => `${keyPrefix}:${key}`;

function getTodo(id) {
  return db.get(makeKey(id));
}

const lib = {
  makeKey,
  getTodo
};

export default lib;
