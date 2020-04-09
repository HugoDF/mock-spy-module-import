import * as db from './db';

const keyPrefix = 'todos';
const makeKey = (key) => `${keyPrefix}:${key}`;

let autoId = 1;

export function addTodo(todo) {
  const id = autoId++;
  const insertable = {
    ...todo,
    id
  };
  return db.set(makeKey(id), insertable);
}

export function getTodo(id) {
  return db.get(makeKey(id));
}
