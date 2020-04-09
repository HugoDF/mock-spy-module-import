jest.mock('./db', () => ({
  get: jest.fn()
}));

const lib = require('./lib.fail');
const mockDb = require('./db');

const {getTodo} = lib;

// Using const means we can't re-assign
let {makeKey} = lib;

beforeEach(() => jest.clearAllMocks());

test('CommonJS > Mocking destructured makeKey doesn’t work', async () => {
  const mockMakeKey = jest.fn(() => 'mock-key');
  makeKey = mockMakeKey;
  await getTodo(1);
  expect(makeKey).not.toHaveBeenCalled();
  expect(mockDb.get).not.toHaveBeenCalledWith('mock-key');
});

test('CommonJS > Mocking lib.makeKey doesn’t work', async () => {
  const mockMakeKey = jest.fn(() => 'mock-key');
  lib.makeKey = mockMakeKey;
  await getTodo(1);
  expect(mockMakeKey).not.toHaveBeenCalled();
  expect(mockDb.get).not.toHaveBeenCalledWith('mock-key');
});

test('CommonJS > Spying lib.makeKey doesn’t work', async () => {
  const makeKeySpy = jest
    .spyOn(lib, 'makeKey')
    .mockImplementationOnce(() => 'mock-key');
  await getTodo(1);
  expect(makeKeySpy).not.toHaveBeenCalled();
  expect(mockDb.get).not.toHaveBeenCalledWith('mock-key');
});
