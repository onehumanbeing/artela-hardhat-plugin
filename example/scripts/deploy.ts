// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
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
