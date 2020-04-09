import db from './db';

const keyPrefix = 'todos';
const makeKey = (key) => `${keyPrefix}:${key}`;

let autoId = 1;

function addTodo(todo) {
  const id = autoId++;
  const insertable = {
    ...todo,
    id
  };
  return db.set(makeKey(id), insertable);
}

function getTodo(id) {
  return db.get(makeKey(id));
}

const lib = {
  addTodo,
  getTodo
};

export default lib;
