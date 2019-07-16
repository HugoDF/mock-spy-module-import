import lib from './lib';
import mockDb from './db';

jest.mock('./db', () => ({
  get: jest.fn()
}));

// Using const means we can't re-assign
let {makeKey} = lib;

beforeEach(() => jest.clearAllMocks());

test("ESM Default Export > Mocking destructured makeKey doesn't work", async () => {
  const mockMakeKey = jest.fn(() => 'mock-key');
  makeKey = mockMakeKey;
  await lib.getTodo(1);
  expect(makeKey).not.toHaveBeenCalled();
  expect(mockDb.get).not.toHaveBeenCalledWith('mock-key');
});

test('ESM Default Export > Mocking lib.makeKey works', async () => {
  const mockMakeKey = jest.fn(() => 'mock-key');
  lib.makeKey = mockMakeKey;
  await lib.getTodo(1);
  expect(mockMakeKey).toHaveBeenCalledWith(1);
  expect(mockDb.get).toHaveBeenCalledWith('mock-key');
});
