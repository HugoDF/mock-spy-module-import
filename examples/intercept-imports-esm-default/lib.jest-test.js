import mockDb from './db';

import lib from './lib';

jest.mock('./db', () => ({
  get: jest.fn(),
  set: jest.fn()
}));

const {addTodo, getTodo} = lib;

beforeEach(() => jest.clearAllMocks());

test('ESM Default Export > addTodo > inserts with new id', async () => {
  await addTodo({name: 'new todo'});
  expect(mockDb.set).toHaveBeenCalledWith('todos:1', {name: 'new todo', id: 1});
});

test('ESM Default Export > getTodo > returns output of db.get', async () => {
  mockDb.get.mockResolvedValueOnce({
    id: 1,
    name: 'todo-1'
  });

  const expected = {
    id: 1,
    name: 'todo-1'
  };
  const actual = await getTodo(1);

  expect(mockDb.get).toHaveBeenCalledWith('todos:1');
  expect(actual).toEqual(expected);
});
