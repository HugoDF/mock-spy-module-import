# Mock/Spy module imports or internals with Jest

JavaScript import/require module testing do's and don'ts with Jest

## Requirements

- Node 10
- Yarn 1.x

## Setup

1. Clone the repository
2. Run `yarn`: installs top-level dependencies (including Lerna).
3. Run `yarn bootstrap`: sets up each example with its dependencies.
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

### Intercepting imports

#### The CommonJS case

#### ES Modules default export

#### ES Modules name export

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


