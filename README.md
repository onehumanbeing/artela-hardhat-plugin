# Hardhat plugin for Artela Network

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

## Test this plugin in a Hardhat project

```
mkdir example && cd example
npx hardhat example  # create an example project
npm install
# TODO: install plugin
npm install dot-env
```

create file .env
```
PRIVATEKEY=0xYOURPRIVATEKEY
```

update hardhat.config.js
```
...
// TODO: replace with npm package
require("../dist/src/index");
const dotenv = require('dotenv');
...

// TODO: divide mainnet and testnet
// TODO: add local network
module.exports = {
  solidity: "0.8.7",
  networks: {
    artela: {
      url: "https://betanet-rpc2.artela.network",
      accounts: [process.env.PRIVATEKEY],
    }
  }
};

```

commands
```
npx hardhat artela # run the local node
npx hardhat compile # compile solidity
npx hardhat compile-aspect # compile the aspect, default aspect/index.ts
npx hardhat deploy-aspect --joinpoints preContractCall --wasm build/index_debug.wasm # deploy the aspect
```

deploy smart contract

scripts/deploy.js 
```
const hre = require("hardhat");

async function main() {
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const initialSupply = "1000000000000000000000"; // 1000 tokens
  const token = await MyToken.deploy(initialSupply);
  await token.deployed();
  console.log("MyToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

run the script

```
npx hardhat run scripts/deploy.ts --network artela   
```

## TODO
* [ x ] Local node
* [ x ] Aspect build and deploy
* [ x ] Aspect bind and unbind
* [ x ] deploy contract and aspect in scripts
* [ x ] Integrate @artela/aspect-tool commands
* [ ] Use custom genesis.json to start local node, add test wallet account with initail balance
* [ ] Add commands like: check account balance
* [ ] Contract send/call
* [ ] Publish NPM package
* [ ] Developer usage documentation
* [ ] Simple deployment for aspects and contracts in scripts
* [ ] Finilize example project
