# Mock/Spy module imports or internals with Jest

JavaScript import/require module testing do's and don'ts with Jest

## Requirements

- Node 10
- Yarn 1.x

## Setup

1. Clone the repository
2. Run `yarn`: installs all required dependencies.
4. Run `yarn test` to run all the tests.

## npm scripts

- `yarn test` will run each example's test suites.
- `yarn lint` will lint all of the example files (and tests)
- `yarn format` will run lint with `--fix` option on all the examples files (and tests).

## Guide

### Types of imports

Modern JavaScript has 2 types of imports:

- CommonJS: Node.js' built-in import system which uses calls to a global `require('module-y')` function, packages on npm expose a CommonJS compatible entry file.
- ES Modules (ESM): modules as defined by the ECMAScript standard. It uses `import x from 'module-y'` syntax.

There are also (legacy) module loaders like RequireJS and AMD but CommonJS and ESM are the current and future most widespread module definition formats for JavaScript.

ES Modules have 2 types of exports: named exports and default exports.

A named export looks likes this: `export function myFunc() {}` or `export const a = 1`.

A default export looks like this: `export default somethingAlreadyDefined`.

A named export can be imported by itself using syntax that looks (and works) a bit like object destructuring: `import { myFunc, a } from './some-module'`.

It can also be imported as a namespace: `import * as moduleY from './module-y'` (can now use `moduleY.myFunc()` and `moduleY.a`).

A default export can only be imported with a default import: `import whateverIsDefault from './moduleY'`.

Theses 2 types of imports can also be mixed and matched, [see `import` docs on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).

### Intercepting imports

When unit-testing, you may want to stub/mock out module(s) that have their own battery of unit tests.

In Jest, this is done with `jest.mock('./path/of/module/to/mock', () => ({ /* fake module */ }))`.

#### The CommonJS case

The full test and code under test is at [examples/intercept-imports-cjs](./examples/intercept-imports-cjs).

The relevant snippets are the following:
```js
jest.mock('./db', () => ({
  get: jest.fn(),
  set: jest.fn()
}));

const mockDb = require('./db');
const {addTodo, getTodo} = require('./lib');

test('CommonJS > addTodo > inserts with new id', async () => {
  await addTodo({name: 'new todo'});
  expect(mockDb.set).toHaveBeenCalledWith('todos:1', {name: 'new todo', id: 1});
});

test('CommonJS > getTodo > returns output of db.get', async () => {
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
```

#### ES Modules default export

The full test and code under test is at [examples/intercept-imports-esm-default](./examples/intercept-imports-esm-default).

```js
import mockDb from './db';

import lib from './lib';

jest.mock('./db', () => ({
  get: jest.fn(),
  set: jest.fn()
}));

const {addTodo, getTodo} = lib;

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
```

#### ES Modules named export

The full test and code under test is at [examples/intercept-imports-esm-named](./examples/intercept-imports-esm-named).

```js
import * as mockDb from './db';

import {addTodo, getTodo} from './lib';

jest.mock('./db', () => ({
  get: jest.fn(),
  set: jest.fn()
}));

test('ESM named export > addTodo > inserts with new id', async () => {
  await addTodo({name: 'new todo'});
  expect(mockDb.set).toHaveBeenCalledWith('todos:1', {name: 'new todo', id: 1});
});

test('ESM named export > getTodo > returns output of db.get', async () => {
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
```

### Spying/Stubbing calls to internal module functions

> Warning: you should not be spying/stubbing module internals, that's your test reaching into the implementation, which means test and code under test are tightly coupled

Concept: "calling through" (as opposed to mocking).

An internal/private/helper function that isn't exported should be tested through its public interface, ie. not by calling it, since it's not exported.

Testing its functionality is the responsibility of the tests of the function(s) that consume said helper.

This is for the cases where:

- you don't have the time to extract the function but the complexity is too high to test through (from the function under test into the internal function)
  - solution: you should probably _make_ time
- the internal function belongs in said module but its complexity make it unwieldy to test through.
  - solution: you should probably extract it
- the function is not strictly internal, it's exported and unit tested, thereforce calling through would duplicate the tests.
  - solution: you should definitely extract it

#### CommonJS

#### ES Modules

#### Nothing to do with ESM/CommonJS

### Spy on imports by referencing the module

> Warning: this will cause you to change the way you write your code just to accomodate a specific type of testing.
>
> This will break if anyone decides to get a copy of the module's function instead of calling `module.fn()` directly.

#### CommonJS

#### ESM


