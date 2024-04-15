const Web3 = require('@artela/web3');

async function getBalance() {
  // TODO: wrap to task in plugin
  const web3 = new Web3("http://127.0.0.1:8545"); // replace with your node URL if different
  const address = '0xf0B2Ad824e98d5A3245A9E3c85dda71D513C37d1'; // replace with the address you want to check
  const balanceWei = await web3.eth.getBalance(address);
  console.log(`The balance of address ${address} is ${balanceWei}.`);
}

getBalance().catch(console.error);