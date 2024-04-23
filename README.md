# Hardhat plugin for Artela Network

This plugin allows you to interact with Artela Network from your Hardhat tasks and scripts.

For usage please view [Guide](Guide.md)

## Installation

To start working on your project, just run

```bash
npm install
```

## Plugin development

Make sure to read our [Plugin Development Guide](https://hardhat.org/advanced/building-plugins.html) to learn how to build a plugin.

## Testing

Running `npm run test` will run every test located in the `test/` folder. They
use [mocha](https://mochajs.org) and [chai](https://www.chaijs.com/),
but you can customize them.

We recommend creating unit tests for your own modules, and integration tests for
the interaction of the plugin with Hardhat and its dependencies.

## Linting and autoformat

All of Hardhat projects use [prettier](https://prettier.io/) and
[tslint](https://palantir.github.io/tslint/).

You can check if your code style is correct by running `npm run lint`, and fix
it with `npm run lint:fix`.

## Building the project

Just run `npm run build` ️👷

## TODO
* [x] Local node
* [x] Aspect build and deploy
* [x] Aspect bind and unbind
* [x] deploy contract and aspect in scripts
* [x] Integrate @artela/aspect-tool commands
* [x] Use custom genesis.json to start local node, add test wallet account with initail balance
* [x] Add commands like: check account balance
* [x] Contract send/call
* [ ] Finilize example project
* [ ] Publish NPM package 0.0.0 (Progress: 50%)
* [ ] Developer usage documentation (readthedocs)
* [ ] Params verification
* [ ] Add more examples
* [ ] built test based on artela devnet