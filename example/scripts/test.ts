const hre = require("hardhat");

async function main() {
    const contractAddress = "0x26002E6C80213da4f2c1d9FD1D3572435CAeF96c";
    const aspectId = "0x02b1BADa2029F78ac232227288B247E2C0891CD5";
    const Contract = await hre.ethers.getContractAt("Storage", contractAddress);

    console.log("Get the aspect context");
    // Call the getAspectContext method
    const key = "ToContract";
    const value = "HelloAspect";

    let validationData = await Contract.callStatic.getAspectContext(aspectId, key);
    console.log('getAspectContext response:', validationData);

    // Call the setAspectContext method
    const response = await Contract.callStatic.setAspectContext(key, value);
    console.log('setAspectContext response:', response);

    // Read the value again
    let newValidationData = await Contract.callStatic.getAspectContext(aspectId, key);
    console.log('getAspectContext response:', newValidationData);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});