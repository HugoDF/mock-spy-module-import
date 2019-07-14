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

### Spy on imports by referencing the module


