const Web3 = require('@artela/web3');
import hre from "hardhat";

async function getBalance() {
  const web3 = new Web3("http://127.0.0.1:8545"); // replace with your node URL if different
  const address = '0x58a016897D9b7694ddBee19892FDA09Ddd2b8782'; // replace with the address you want to check
  const balanceWei = await web3.eth.getBalance(address);
  console.log(`The balance of address ${address} is ${balanceWei}.`);
}

getBalance().catch(console.error);