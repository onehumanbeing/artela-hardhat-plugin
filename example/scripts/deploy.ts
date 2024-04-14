// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
import { bindAspect, deployAspect } from "../../dist/src/internal/aspect";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const initialSupply = "1000000000000000000000"; // 1000 tokens
  const token = await MyToken.deploy(initialSupply);
  await token.deployed();

  console.log("MyToken deployed to:", token.address);
  // aspect deploy
  const aspect = await deployAspect("[]", ["preContractCall"], "build/index_debug.wasm", "");
  console.log("Aspect deployed to:", aspect);
  // bind
  const bind = await bindAspect(token.address, aspect, "");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
