const hre = require("hardhat");
import { bindAspect, deployAspect, getBoundAddress, getBoundAspect } from "../../dist/src/internal/aspect";

async function testContract(contractAddress: string, aspectId: string) {
  const Contract = await hre.ethers.getContractAt("Storage", contractAddress);
  console.log("Get the aspect context");
  let validationData = await Contract.callStatic.getAspectContext(aspectId, "ToContract");
  console.log('getAspectContext response:', validationData);
  // Call the setAspectContext method
  const response = await Contract.callStatic.setAspectContext("ToAspect", "HelloAspect");
  console.log('setAspectContext response:', response);
}

async function main() {
  const network = hre.network.name;
  const Storage = await hre.ethers.getContractFactory("Storage");
  const initialSupply = "1000000000000000000000";
  console.log("start deploy")
  const token = await Storage.deploy({ gasLimit: 9000000 });
  await token.deployed();
  const aspect = await deployAspect("[]", ["preTxExecute", "postTxExecute"], "build/index_debug.wasm", "", network);
  const bind = await bindAspect(token.address, aspect, "9000000", network);
  console.log("deployed aspect", aspect, "contract: ", token.address);
  const boundAddress = await getBoundAddress(aspect, network);
  const boundAspect = await getBoundAspect(token.address, network);
  await testContract(token.address, aspect);
  console.log("done")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});
