const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { getArtelaConfig, getExplorerUrl } = require("./utils");

const Web3 = require("@artela/web3");
const ARTELA_ADDR = "0x0000000000000000000000000000000000A27E14";
const ASPECT_ADDR = "0x0000000000000000000000000000000000A27E14";

/**
 * Compiles an AssemblyScript file.
 *
 * @param {string} entryFile The path to the source file.
 * @param {string} target The compilation target: 'debug' or 'release'.
 * @param {string} output The path to the output file.
 */

export async function compileAspect(
  entryFile: string = "aspect/index.ts",
  target: "debug" | "release" = "debug",
  output: string | null
) {
  const filename = path.basename(entryFile, path.extname(entryFile));
  if (!output) {
    if (target === "release") {
      output = `build/${filename}.wasm`;
    } else {
      output = `build/${filename}_debug.wasm`;
    }
  }

  // Check if the build directory exists, if not, create it
  const buildDir = path.dirname(output);
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }

  const command = "npx";
  const args = ["asc", entryFile, "--target", target, "-o", output];

  console.log(`Running command: ${command} ${args.join(" ")}`);
  const childProcess = spawn(command, args);
  childProcess.stdout.on("data", (data: any) => {
    console.log("stdout event triggered.");
    console.log(`stdout: ${data}`);
  });

  childProcess.stderr.on("data", (data: any) => {
    console.log("stderr event triggered.");
    console.error(`stderr: ${data}`);
  });

  childProcess.on("close", (code: any) => {
    console.log("close event triggered.");
    if (code !== 0) {
      console.error(
        `Failed to compile AssemblyScript: process exited with code ${code}`
      );
      process.exit(code);
    } else {
      console.log("AssemblyScript compilation completed successfully.");
    }
  });
}

export async function deployAspect(
  properties: string | null,
  joinPoints: Array<string> | null,
  wasmPath: string,
  gas: string,
  network: string = "artela"
) {
  // TODO: gas nullable for default value
  const { nodeUrl, privateKey } = getArtelaConfig(network);
  if (!privateKey) return;
  const web3 = new Web3(nodeUrl);
  let gasPrice = await web3.eth.getGasPrice();
  let sender = web3.eth.accounts.privateKeyToAccount(privateKey.trim());
  console.log("from address: ", sender.address);
  web3.eth.accounts.wallet.add(sender.privateKey);
  let propertiesArr = properties ? JSON.parse(properties) : [];
  let joinPointsArr = joinPoints || [];
  const validJoinPoints = [
    "preContractCall",
    "postContractCall",
    "preTxExecute",
    "postTxExecute",
    "verifyTx",
  ];
  for (const joinPoint of joinPointsArr) {
    if (!validJoinPoints.includes(joinPoint)) {
      console.log(`Invalid join point: ${joinPoint}`);
      process.exit(0);
    }
  }
  //read wasm code
  let aspectCode = "";
  aspectCode = fs.readFileSync(wasmPath, { encoding: "hex" });
  if (!aspectCode || aspectCode === "") {
    console.log("aspectCode cannot be empty");
    process.exit(0);
  }
  // to deploy aspect
  let aspect = new web3.atl.Aspect();
  let deploy = await aspect.deploy({
    data: "0x" + aspectCode,
    properties: propertiesArr,
    joinPoints: joinPointsArr,
    paymaster: sender.address,
    proof: "0x0",
  });

  let tx = {
    from: sender.address,
    data: deploy.encodeABI(),
    to: ARTELA_ADDR,
    gasPrice,
    gas: parseInt(gas) || 9000000,
  };
  let signedTx = await web3.atl.accounts.signTransaction(tx, sender.privateKey);
  console.log("deployAspect: sending signed transaction...");
  let ret = await web3.atl
    .sendSignedTransaction(signedTx.rawTransaction)
    .on("receipt", (receipt: any) => {
      console.log("receipt:", receipt);
      const explorerUrl = getExplorerUrl(receipt.transactionHash, network);
      if (explorerUrl) {
        console.log(`View the transaction on the explorer: ${explorerUrl}`);
      }
    });
  let aspectID = ret.aspectAddress;
  console.log("aspectID:", aspectID);
  return aspectID;
}

export async function bindAspect(
  contractAddress: string,
  aspectId: string,
  gas: string,
  network: string = "artela"
) {
  // TODO: gas nullable for default value
  const { nodeUrl, privateKey } = getArtelaConfig(network);
  if (!privateKey) return;
  const web3 = new Web3(nodeUrl);
  let gasPrice = await web3.eth.getGasPrice();
  let sender = web3.eth.accounts.privateKeyToAccount(privateKey.trim());
  web3.eth.accounts.wallet.add(sender.privateKey);
  let storageInstance = new web3.eth.Contract([], contractAddress);
  let bind = await storageInstance.bind({
    priority: 1,
    aspectId: aspectId,
    aspectVersion: 1,
  });
  let tx = {
    from: sender.address,
    data: bind.encodeABI(),
    gasPrice,
    to: ASPECT_ADDR,
    gas: parseInt(gas) || 9000000,
  };
  let signedTx = await web3.eth.accounts.signTransaction(tx, sender.privateKey);
  console.log("bindAspect: sending signed transaction...");
  let ret = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .on("receipt", (receipt: any) => {
      console.log("receipt:", receipt);
      const explorerUrl = getExplorerUrl(receipt.transactionHash, network);
      if (explorerUrl) {
        console.log(`View the transaction on the explorer: ${explorerUrl}`);
      }
    });
  console.log("Aspect bind success");
}

export async function unbindAspect(
  contractAddress: string,
  aspectId: string,
  gas: string,
  network: string = "artela"
) {
  // TODO: gas nullable for default value
  const { nodeUrl, privateKey } = getArtelaConfig(network);
  if (!privateKey) return;
  const web3 = new Web3(nodeUrl);
  let gasPrice = await web3.eth.getGasPrice();
  let sender = web3.eth.accounts.privateKeyToAccount(privateKey.trim());
  web3.eth.accounts.wallet.add(sender.privateKey);
  const aspectContract = new web3.atl.aspectCore();
  // bind the smart contract with aspect
  const unbind = await aspectContract.methods.unbind(aspectId, contractAddress);
  const tx = {
    from: sender.address,
    data: unbind.encodeABI(),
    gasPrice,
    to: aspectContract.options.address,
    gas: parseInt(gas) || 9000000,
  };
  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    sender.privateKey
  );
  let ret = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .on("receipt", (receipt: any) => {
      console.log("receipt:", receipt);
      const explorerUrl = getExplorerUrl(receipt.transactionHash, network);
      if (explorerUrl) {
        console.log(`View the transaction on the explorer: ${explorerUrl}`);
      }
    });
  console.log("Aspect unbind success");
}

export async function createAccount() {
  let account;
  const web3 = new Web3("http://localhost:8545");
  let privateFile = "privateKey.txt";
  if (fs.existsSync(privateFile)) {
    console.log("private key file (privateKey.txt) exists");
    let pk = fs.readFileSync(privateFile, "utf-8");
    account = web3.atl.accounts.privateKeyToAccount(pk.trim());
  } else {
    console.log("create privateKey.txt");
    account = web3.atl.accounts.create();
    const dirPath = path.dirname(privateFile);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    fs.writeFileSync(privateFile, account.privateKey);
  }
  web3.atl.accounts.wallet.add(account.privateKey);
  console.log("address: ", account.address);
}

export async function getBoundAddress(
  aspectId: string,
  network: string = "artela"
) {
  const { nodeUrl } = getArtelaConfig(network);
  const web3 = new Web3(nodeUrl);
  const aspectContract = new web3.atl.aspectCore();
  let boundAddresses = await aspectContract.methods["boundAddressesOf"](
    aspectId
  ).call();
  console.log("boundAddress: ", boundAddresses);
  return boundAddresses;
}

export async function getBoundAspect(
  contractAddress: string,
  network: string = "artela"
) {
  const { nodeUrl } = getArtelaConfig(network);
  const web3 = new Web3(nodeUrl);
  const aspectContract = new web3.atl.aspectCore();
  let boundAspect = await aspectContract.methods["aspectsOf"](
    contractAddress
  ).call();
  console.log("boundAspect: ", boundAspect);
  return boundAspect;
}
