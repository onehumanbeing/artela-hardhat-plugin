// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
import { bindAspect, deployAspect, getBoundAddress, getBoundAspect } from "../../dist/src/internal/aspect";

async function main() {
  const network = hre.network.name;
  const Storage = await hre.ethers.getContractFactory("Storage");
  const initialSupply = "1000000000000000000000";
  console.log("start deploy")
  const token = await Storage.deploy({ gasLimit: 9000000 });
  await token.deployed();
  const aspect = await deployAspect("[]", ["preTxExecute", "postTxExecute"], "build/index_debug.wasm", "", network);
  // const bind = await bindAspect(token.address, aspect, "9000000", network);
  console.log("deployed aspect", aspect, "contract: ", token.address);
  // const boundAddress = await getBoundAddress(aspect, network);
  // const boundAspect = await getBoundAspect(token.address, network);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});
