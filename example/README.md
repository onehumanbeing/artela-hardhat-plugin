Migrate from https://github.com/artela-network/aspect-example/tree/main/transientStorage

# Start

```
mv .env.example .env 
```

Setup your private key in .env, or create one with 'npx hardhat create-account'

compile solidity contracts and aspect.

```
npx hardhat compile
npx hardhat compile-aspect
```

(Optional) Run devnet with `npx hardhat devnet`

```
npx hardhat devnet
```

> Change the network parameter to in the following steps: --network local 

deploy contracts and aspect, and bind them.

testnet
```
npx hardhat run scripts/deploy.ts --network artela
```

local devnet
```
npx hardhat run scripts/deploy.ts --network local
```