import * as lib from './lib.named-export';
import mockDb from './db';

const {getTodo} = lib;

jest.mock('./db', () => ({
  get: jest.fn()
}));

// Using const means we can't re-assign
let {makeKey} = lib;

beforeEach(() => jest.clearAllMocks());

test("ESM Named Export > Mocking destructured makeKey doesn't work", async () => {
  makeKey = jest.fn(() => 'mock-key');
  await getTodo(1);
  expect(makeKey).not.toHaveBeenCalled();
  expect(mockDb.get).not.toHaveBeenCalledWith('mock-key');
});

test("ESM Named Export > Mocking lib.makeKey doesn't work", async () => {
  const mockMakeKey = jest.fn(() => 'mock-key');
  lib.makeKey = mockMakeKey; // eslint-disable-line import/namespace
  await getTodo(1);
  expect(mockMakeKey).not.toHaveBeenCalled();
  expect(mockDb.get).not.toHaveBeenCalledWith('mock-key');
});

test("ESM Named Export > Spying lib.makeKey doesn't work", async () => {
  const makeKeySpy = jest
    .spyOn(lib, 'makeKey')
    .mockImplementationOnce(() => 'mock-key');
  await getTodo(1);
  expect(makeKeySpy).not.toHaveBeenCalled();
  expect(mockDb.get).not.toHaveBeenCalledWith('mock-key');
});
