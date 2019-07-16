const db = require('./db');

const keyPrefix = 'todos';
const makeKey = key => `${keyPrefix}:${key}`;

let autoId = 1;

async function addTodo(todo) {
  const id = autoId++;
  const insertable = {
    ...todo,
    id
  };
  await db.set(makeKey(id), insertable);
}

function getTodo(id) {
  return db.get(makeKey(id));
}

module.exports = {
  addTodo,
  getTodo
};
