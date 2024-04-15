require("@nomiclabs/hardhat-waffle");
require("../dist/src/index");
const dotenv = require('dotenv');

dotenv.config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
// TODO: divide mainnet and testnet
// TODO: add local network
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

