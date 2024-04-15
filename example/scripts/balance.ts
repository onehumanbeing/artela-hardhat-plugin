const Web3 = require('@artela/web3');

async function getBalance() {
  // TODO: wrap to task in plugin
  const web3 = new Web3("http://127.0.0.1:8545"); // replace with your node URL if different
  const address = '0x636B813875bFEEb5941089b07c18Cf6F31B27C55'; // replace with the address you want to check
  const balanceWei = await web3.eth.getBalance(address);
  const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
  console.log(`The balance of address ${address} is ${balanceEth} ART.`);
}

getBalance().catch(console.error);