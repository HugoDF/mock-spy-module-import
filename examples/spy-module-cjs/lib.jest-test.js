const db = require('./db');

const {addTodo, getTodo} = require('./lib');

beforeEach(() => jest.clearAllMocks());

test('CommonJS > addTodo > inserts with new id', async () => {
  const dbSetSpy = jest.spyOn(db, 'set').mockImplementation(() => {});
  await addTodo({name: 'new todo'});
  expect(dbSetSpy).toHaveBeenCalledWith('todos:1', {name: 'new todo', id: 1});
});

test('CommonJS > getTodo > returns output of db.get', async () => {
  const dbGetSpy = jest.spyOn(db, 'get').mockResolvedValueOnce({
    id: 1,
    name: 'todo-1'
  });

  const expected = {
    id: 1,
    name: 'todo-1'
  };
  const actual = await getTodo(1);

  expect(dbGetSpy).toHaveBeenCalledWith('todos:1');
  expect(actual).toEqual(expected);
});
