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

In this case the CommonJS and ES6 Module mocks look quite similar. There are a few general gotchas.

First off, what you're mocking with (2nd parameter of `jest.mock`) is a factory for the module. ie. it's a function that returns a mock module object.

Second, if you want to reference a variable from the parent scope of `jest.mock` (you want to define your mock module instance for example), you need to prefix the variable name with `mock`.
For example:

```js
const mockDb = {
  get: jest.fn(),
  set: jest.fn()
};
const db = mockDb

// This works
jest.mock('./db', () => mockDb);

// This doesn't work
jest.mock('./db', () => db);
```

Finally, you should call `jest.mock` _before_ importing the module under test (which itself imports the module we just mocked).

In practice, Babel ESM -> CommonJS transpilation hoists the `jest.mock` call so it's usually not an issue 🤷‍♀.

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

An internal/private/helper function that isn't exported should be tested through its public interface, ie. not by calling it, since it's not exported, but by calling the function that calls it.

Testing its functionality is the responsibility of the tests of the function(s) that consume said helper.

This is for the cases where:

- you don't have the time to extract the function but the complexity is too high to test through (from the function under test into the internal function)
  - solution: you should probably _make_ time
- the internal function belongs in said module but its complexity make it unwieldy to test through.
  - solution: you should probably extract it
- the function is not strictly internal, it's exported and unit tested, thereforce calling through would duplicate the tests.
  - solution: you should definitely extract it

In the following cases we'll be looking to stub/mock/spy the internal `makeKey` function. This is purely for academic purposes since, we've shown in the section above how to **test through** the `getTodo` call.

In that situation we were testing `expect(mockDb.get).toHaveBeenCalledWith('todos:1');` (see [examples/intercept-imports-cjs/lib.jest-test.js](./examples/intercept-imports-cjs/lib.jest-test.js)). The generation of the `todos:1` key is the functionality of `makeKey`, that's an example of testing by **calling through**.

#### CommonJS

##### A module where internal functions can't be mocked

Code listing lifted from [examples/spy-internal-calls-cjs/lib.fail.js](./examples/spy-internal-calls-cjs/lib.fail.js).

```js
const db = require('./db');

const keyPrefix = 'todos';
const makeKey = key => `${keyPrefix}:${key}`;

function getTodo(id) {
  return db.get(makeKey(id));
}

module.exports = {
  makeKey,
  getTodo
};
```

As you can see when you run the [examples/spy-internal-calls-cjs/lib.fail.jest-test.js](./examples/spy-internal-calls-cjs/lib.fail.jest-test.js) tests, there's no way to intercept calls to `makeKey`.

##### A module where internal function _can_ be mocked

Code listing lifted from [examples/spy-internal-calls-cjs/lib.js](./examples/spy-internal-calls-cjs/lib.js).

```js
const db = require('./db');

const keyPrefix = 'todos';
const makeKey = key => `${keyPrefix}:${key}`;

const lib = {
  // Could also define makeKey inline like so:
  // makeKey(key) { return `${keyPrefix}:${key}` },
  makeKey,
  getTodo(id) {
    return db.get(lib.makeKey(id));
  }
};

module.exports = lib;
```

##### Mocking/Spying the internal function

Code listing lifted from [examples/spy-internal-calls-cjs/lib.jest-test.js](./examples/spy-internal-calls-cjs/lib.jest-test.js)

```js
// ignore setup code
test("CommonJS > Mocking destructured makeKey doesn't work", async () => {
  const mockMakeKey = jest.fn(() => 'mock-key');
  makeKey = mockMakeKey;
  await getTodo(1);
  expect(makeKey).not.toHaveBeenCalled();
  expect(mockDb.get).not.toHaveBeenCalledWith('mock-key');
});

test('CommonJS > Mocking lib.makeKey works', async () => {
  const mockMakeKey = jest.fn(() => 'mock-key');
  lib.makeKey = mockMakeKey;
  await getTodo(1);
  expect(mockMakeKey).toHaveBeenCalledWith(1);
  expect(mockDb.get).toHaveBeenCalledWith('mock-key');
});

test('CommonJS > Spying lib.makeKey works', async () => {
  const makeKeySpy = jest
    .spyOn(lib, 'makeKey')
    .mockImplementationOnce(() => 'mock-key');
  await getTodo(1);
  expect(makeKeySpy).toHaveBeenCalled();
  expect(mockDb.get).toHaveBeenCalledWith('mock-key');
});
```

From the above we can see that with the setup from the previous section (see [examples/spy-internal-calls-cjs/lib.js](./examples/spy-internal-calls-cjs/lib.js)), we're able to both replace the implementation of `lib.makeKey` with a mock and spy on it.

We're still unable to replace our reference to it. That's because when we destructure `lib` to extract `makeKey` we create a copy of the reference ie. `makeKey = newValue` changes the implementation of the `makeKey` variable we have in our test file but doesn't replace the behaviour of `lib.makeKey` (which is what `getTodo` is calling).

To illustrate:
```js
const lib = require('./lib');
let {makeKey} = lib;

makeKey = 'something';

// `lib.makeKey` and `makeKey` are now different...
```

#### ES Modules

##### Difficulty of Named exports

In the case of ES6 Modules, semantically, it's quite difficult to set the code up in a way that would work with named exports, the following code doesn't quite work:
```js
import db from './db';

const keyPrefix = 'todos';
export const makeKey = key => `${keyPrefix}:${key}`;

export function getTodo(id) {
  return db.get(makeKey(id));
}
```
Code listing lifted from [examples/spy-internal-calls-esm/lib.named-export.js](./examples/spy-internal-calls-esm/lib.named-export.js), tests showing there's no simple way to mock/spy on `makeKey` are at [examples/spy-internal-calls-esm/lib.named-export.jest-test.js](./examples/spy-internal-calls-esm/lib.named-export.jest-test.js)

##### Unmockeable modules with default exports

Code listing lifted from [examples/spy-internal-calls-esm/lib.default-export.js](./examples/spy-internal-calls-esm/lib.default-export.js).

```js
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
```

Tests showing there's no simple way to mock/spy on `makeKey` are at [examples/spy-internal-calls-esm/lib.default-export.jest-test.js](./examples/spy-internal-calls-esm/lib.default-export.jest-test.js).

The reason this doesn't work is the same as the CommonJS example, `makeKey` is directly referenced and that reference can't be modified from outside of the module.

Anything attempting import it would make a copy and therefore wouldn't modify the internal reference.

##### Mock/Spy setup with ESM

Code listing lifted from [examples/spy-internal-calls-esm/lib.js](./examples/spy-internal-calls-esm/lib.js)

```js
import db from './db';

const keyPrefix = 'todos';
const makeKey = key => `${keyPrefix}:${key}`;

const lib = {
  // Could also define makeKey inline like so:
  // makeKey(key) { return `${keyPrefix}:${key}` },
  makeKey,
  getTodo(id) {
    return db.get(lib.makeKey(id));
  }
};

export default lib;
```

Passing tests for the above are at [examples/spy-internal-calls-esm/lib.jest-test.js](./examples/spy-internal-calls-esm/lib.jest-test.js)

**Note**, it would be possible to do something similar with named exports:

```js
import db from './db';

const keyPrefix = 'todos';
const makeKey = key => `${keyPrefix}:${key}`;

export const lib = {
  // Could also define makeKey inline like so:
  // makeKey(key) { return `${keyPrefix}:${key}` },
  makeKey,
  getTodo(id) {
    return db.get(lib.makeKey(id));
  }
};
```

The key point is around exporting a `lib` object and referencing that same object when calling `makeKey`.

#### Nothing to do with ESM/CommonJS

Being able to mock a part of a module is all about references.

If a function is calling another function using a reference that's not accessible from outside of the module (more specifically from our the test), then it can't be mocked.

### Spy on imports or mock part of a module by "referencing the module"

> Warning: this will cause you to change the way you write your code just to accomodate a specific type of testing.
>
> This will break if anyone decides to get a copy of the module's function instead of calling `module.fn()` directly.

#### CommonJS: Spy import/mock part of a module with Jest

Code listing lifted from [examples/spy-module-cjs/lib.js](./examples/spy-module-cjs/lib.js).

Note how the `db` module is imported without destructuring and how any calls to it are done using `db.method()` calls.

```js
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
```

We are now able to spy on `db.method` using the following approach:

```js
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
```

Notice how we're not calling `jest.mock()`. Instead we're mocking/spying only a specific function of the module when we need to by modifying the `db` module implementation.

#### ES6 Modules: Spy import/mock part of a module with Jest

##### Default exports

Assuming our `db.js` module exports in the following manner (see [examples/spy-module-esm-default/db.js](./examples/spy-module-esm-default/db.js)):
```js
const data = {};

async function get(k) {
  return data[k];
}

async function set(k, v) {
  data[k] = v;
}

const db = {
  get,
  set
};

export default db;
```

We can then import it as follows (code listing lifted from [examples/spy-module-esm-default/lib.js](./examples/spy-module-esm-default/lib.js)):

```js
import db from './db';

const keyPrefix = 'todos';
const makeKey = key => `${keyPrefix}:${key}`;

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
```

Spying on the import/mocking part of the module becomes possible in the following fashion (full code at [examples/spy-module-esm-default/lib.jest-test.js](./examples/spy-module-esm-default/lib.jest-test.js)):

```js
import db from './db';

import lib from './lib';

const {addTodo, getTodo} = lib;

beforeEach(() => jest.clearAllMocks());

test('ESM Default Export > addTodo > inserts with new id', async () => {
  const dbSetSpy = jest.spyOn(db, 'set').mockImplementationOnce(() => {});
  await addTodo({name: 'new todo'});
  expect(dbSetSpy).toHaveBeenCalledWith('todos:1', {name: 'new todo', id: 1});
});

test('ESM Default Export > getTodo > returns output of db.get', async () => {
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
```

Notice how we don't mock the `db` module with a `jest.mock()` call. Again we spy on the method that we're interested in stubbing/spying for a particular test.

We leverage `mockImplementationOnce()` to avoid calling the real function (which you might not always want to do).

##### Named exports + "import * as alias from 'module-name'"

> Note: I've not read the full spec, the fact that this works might be a quirk of the Babel ES2015 module transpilation

Assuming we've defined `db.js` as follows (using named exports, see the file at [examples/spy-module-esm-named/db.js](./examples/spy-module-esm-named/db.js)):

```js
const data = {};

export async function get(k) {
  return data[k];
}

export async function set(k, v) {
  data[k] = v;
}
```

We can import all the named exports under an alias with `import * as db from './db'` (code listing lifted from [examples/spy-module-esm-named/lib.js](./examples/spy-module-esm-named/lib.js)):
```js
import * as db from './db';

const keyPrefix = 'todos';
const makeKey = key => `${keyPrefix}:${key}`;

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
```

The calls to db.set and db.get can be spied/mocked using the following approach (full code test file at [examples/spy-module-esm-named/lib.jest-test.js](./examples/spy-module-esm-named/lib.jest-test.js)):

```js
import * as db from './db';

import {addTodo, getTodo} from './lib';

beforeEach(() => jest.clearAllMocks());

test('ESM named export > addTodo > inserts with new id', async () => {
  const dbSetSpy = jest.spyOn(db, 'set').mockImplementationOnce(() => {});
  await addTodo({name: 'new todo'});
  expect(dbSetSpy).toHaveBeenCalledWith('todos:1', {name: 'new todo', id: 1});
});

test('ESM named export > getTodo > returns output of db.get', async () => {
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
```
