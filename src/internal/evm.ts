import { getArtelaConfig } from './utils';
import { HardhatRuntimeEnvironment } from "hardhat/types";

const Web3 = require("@artela/web3");

export async function getBalance(address: string, network: string = 'artela') {
    const { nodeUrl } = getArtelaConfig(network);
    const web3 = new Web3(nodeUrl);
    const balanceWei = await web3.eth.getBalance(address);
    const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
    return balanceEth;
    // console.log(`The balance of address ${address} is ${balanceEth} ART.`);
}

export async function transfer(from: string, to: string, amount: string, network: string = 'artela', gas: string) {
    const { nodeUrl, privateKey } = getArtelaConfig(network);
    const web3 = new Web3(nodeUrl);
    const amountWei = web3.utils.toWei(amount, 'ether');
    const transaction = {
      from,
      to,
      value: amountWei,
      gas: parseInt(gas) || 21000
    };
    const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    return receipt.transactionHash;
    // console.log(`Transaction sent with hash ${receipt.transactionHash}`);
  }

export async function callContract(hre: HardhatRuntimeEnvironment, name: string, contractAddress: string, method: string, args: Array<any> = [], network: string = 'artela') {    
    const { nodeUrl } = getArtelaConfig(network);
    const web3 = new Web3(nodeUrl);
    const artifact = await hre.artifacts.readArtifact(name);
    const abi = artifact.abi;
    let storageInstance = new web3.eth.Contract(abi, contractAddress);
    let instance = await storageInstance.methods[method](...args).call();
    console.log(instance.toString());
    return instance.toString()
}