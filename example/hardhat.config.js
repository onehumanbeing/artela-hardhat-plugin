require("@nomiclabs/hardhat-waffle");
require("../dist/src/index");
const dotenv = require('dotenv');

dotenv.config();
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.7",
  networks: {
    artela: {
      url: "https://betanet-rpc2.artela.network",
      accounts: [process.env.PRIVATEKEY],
    },
    local: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.PRIVATEKEY_LOCAL],
    }
  }
};