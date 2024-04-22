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

module.exports = {
  solidity: "0.8.7",
  networks: {
    artela: {
      url: "https://betanet-rpc2.artela.network",
      accounts: [process.env.PRIVATEKEY],
    },
    local: {
      url: "http://127.0.0.1:8545",
      accounts: ["0xc5e3059ac8e54e415e3d81831fc24f292f825ae3d2690bab97d3e3c80065046e"],
    }
  }
};

```

commands
```
npx hardhat compile # compile solidity
npx hardhat compile-aspect # compile the aspect, default aspect/index.ts
npx hardhat deploy-aspect --joinpoints preContractCall --wasm build/index_debug.wasm # deploy the aspect

npx hardhat call --contract Storage --address $CONTRACT  --method getAspectContext --network artela  $ASPECT ToContract
npx hardhat get-balance --address 0x376b40c51E96AbCE9F00a2d7aAf6b6e5519a7898
npx hardhat transfer --from  0x376b40c51E96AbCE9F00a2d7aAf6b6e5519a7898 --to 0xe5107dee9CcC8054210FF6129cE15Eaa5bbcB1c0 --amount 0.01 
```

deploy smart contract

scripts/deploy.js 
```
const hre = require("hardhat");
import { bindAspect, deployAspect } from "../../dist/src/internal/aspect";

async function main() {
  const network = hre.network.name;
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const initialSupply = "1000000000000000000000";
  console.log("start deploy")
  const token = await MyToken.deploy(initialSupply, { gasLimit: 9000000 }); // , { gasLimit: 9000000 } when local ??
  await token.deployed();
  console.log("MyToken deployed to:", token.address);
  // aspect deploy
  const aspect = await deployAspect("[]", ["preContractCall"], "build/index_debug.wasm", "", network);
  console.log("Aspect deployed to:", aspect);
  // bind
  const bind = await bindAspect(token.address, aspect, "9000000", network);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
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

## How to launch local devnet 

#### prerequisites

install go, [jq](https://jqlang.github.io/jq/download/)

run script
```
npx hardhat artela # run the local node
```

initail test wallet with balance

| Address                                    | Private Key                                                  | Bech32 Acc                              |
| ------------------------------------------ | ------------------------------------------------------------ | --------------------------------------- |
| 0x636B813875bFEEb5941089b07c18Cf6F31B27C55 | 0xd63ca10fae51e35945cb366d7601ea79d65e79aa176c82fbb3df2cfd8d58fcb5 | art1vd4czwr4hlhtt9qs3xc8cxx0ducmylz4sh4l5m |
| 0xAdbc81cDb00a2461A5Ab70a3DF1401E0a79a1478 | 0x7b13c9f33b3b5663700297471733a88796fccc33b0da8e9b813f7a8422533304 | art14k7grndspgjxrfdtwz3a79qpuzne59rcg5y2vp |
| 0xf0B2Ad824e98d5A3245A9E3c85dda71D513C37d1 | 0xc5e3059ac8e54e415e3d81831fc24f292f825ae3d2690bab97d3e3c80065046e | art17ze2mqjwnr26xfz6nc7gthd8r4gncd73a585zw |
| 0x2ABb8c7bf395326C2A3B489D3fDe844822e55ccf | 0x91c00a2cbf598cdb1173d06674d8ee7fea71437c196867f4d9a0088105f697c0 | art192acc7lnj5exc23mfzwnlh5yfq3w2hx06pkj0u |

## TODO
* [x] Local node
* [x] Aspect build and deploy
* [x] Aspect bind and unbind
* [x] deploy contract and aspect in scripts
* [x] Integrate @artela/aspect-tool commands
* [x] Use custom genesis.json to start local node, add test wallet account with initail balance
* [x] Add commands like: check account balance
* [x] Contract send/call
* [x] Finilize example project
* [x] Publish NPM package 0.0.0
* [ ] Developer usage documentation (readthedocs)
* [ ] Params verification
* [ ] Add more examples