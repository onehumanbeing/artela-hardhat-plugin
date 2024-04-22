import { extendConfig, extendEnvironment, task } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";
import { spawn } from "child_process";
import { compileAspect, deployAspect, createAccount, getBoundAddress, getBoundAspect } from "./internal/aspect";
import { getBalance, transfer, callContract } from "./internal/evm";
import { getExplorerUrl } from "./internal/utils";
// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // We apply our default config here. Any other kind of config resolution
    // or normalization should be placed here.
    //
    // `config` is the resolved config, which will be used during runtime and
    // you should modify.
    // `userConfig` is the config as provided by the user. You should not modify
    // it.
    //
    // If you extended the `HardhatConfig` type, you need to make sure that
    // executing this function ensures that the `config` object is in a valid
    // state for its type, including its extensions. For example, you may
    // need to apply a default value, like in this example.
    const userPath = userConfig.paths?.newPath;

    let newPath: string;
    if (userPath === undefined) {
      newPath = path.join(config.paths.root, "newPath");
    } else {
      if (path.isAbsolute(userPath)) {
        newPath = userPath;
      } else {
        // We resolve relative paths starting from the project's root.
        // Please keep this convention to avoid confusion.
        newPath = path.normalize(path.join(config.paths.root, userPath));
      }
    }

    config.paths.newPath = newPath;
  }
);

task("devnet", "run artela devnet local")
  .setAction(async () => {
    console.log("Running artela devnet local");
    const scriptPath = path.join(__dirname, 'local_node.sh');
    const build = spawn('bash', [scriptPath], { stdio: 'inherit' });
    await new Promise((resolve, reject) => {
      build.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        resolve(code);
      });

      build.on('error', (err) => {
        reject(err);
      });
    });
});

task("artela", "setup artela directory")
  .setAction(async () => {
    const scriptPath = path.join(__dirname, 'init.sh');
    const build = spawn('bash', [scriptPath], { stdio: 'inherit' });
    await new Promise((resolve, reject) => {
      build.on('close', (code) => {
        resolve(code);
      });
      build.on('error', (err) => {
        reject(err);
      });
    });
});

task("compile-aspect", "Compiles Aspect")
  .addOptionalParam("file", "The entry file to compile", "aspect/index.ts")
  .addOptionalParam("target", "The compilation target: 'debug' or 'release'", "debug")
  .addOptionalParam("output", "The path to the output file")
  .setAction(async (taskArgs, hre) => {
    if (!["debug", "release"].includes(taskArgs.target)) {
      console.error("Invalid target. Please choose 'debug' or 'release'.");
      process.exit(1);
    }
    await compileAspect(taskArgs.file, taskArgs.target, taskArgs.output);
  });

task("deploy-aspect", "Deploys an aspect")
  .addOptionalParam("properties", "The properties of the aspect", "[]")
  .addOptionalParam("joinpoints", "The join points of the aspect", "[]")
  .addOptionalParam("wasm", "The path to the wasm file")
  .addOptionalParam("gas", "The gas for the transaction")
  .setAction(async (taskArgs, hre) => {
    await deployAspect(taskArgs.properties, taskArgs.joinpoints, taskArgs.wasm, taskArgs.gas, taskArgs.network);
});

task("create-account", "Creates an account")
  .setAction(async (taskArgs, hre) => {
    await createAccount();
});

task("get-bound-address", "Gets the address bound to an aspect")
  .addParam("aspectId", "The ID of the aspect")
  .setAction(async (taskArgs, hre) => {
    await getBoundAddress(taskArgs.aspectId, taskArgs.network);
});

task("get-bound-aspect", "Gets the aspect bound to an address")
  .addParam("contractAddress", "The address of the contract")
  .setAction(async (taskArgs, hre) => {
    await getBoundAspect(taskArgs.contractAddress, taskArgs.network);
});

task("get-balance", "Get the balance of an address")
  .addParam("address", "The address to check")
  .setAction(async (taskArgs, hre) => {
    const balance = await getBalance(taskArgs.address, taskArgs.network);
    console.log(`The balance of address ${taskArgs.address} is ${balance} ART.`);
  });

task("transfer", "Transfers ART from one address to another")
  .addParam("from", "The sender's address")
  .addParam("to", "The recipient's address")
  .addParam("amount", "The amount to transfer")
  .addOptionalParam("gas", "The gas limit", "21000")
  .setAction(async (taskArgs, hre) => {
    const txHash = await transfer(taskArgs.from, taskArgs.to, taskArgs.amount, taskArgs.network, taskArgs.gas);
    console.log(`Transaction sent with hash ${txHash}`);
    const explorerUrl = getExplorerUrl(txHash, taskArgs.network);
    if (explorerUrl) {
      console.log(`View the transaction on the explorer: ${explorerUrl}`);
    }
  });

task("call", "Calls a method in a contract")
  .addParam("contract", "The name of the contract")
  .addParam("address", "The address of the contract")
  .addParam("method", "The method to call")
  .addOptionalVariadicPositionalParam("args", "The arguments to pass to the method", [])
  .setAction(async (taskArgs, hre) => {
    const result = await callContract(hre, taskArgs.contract, taskArgs.address, taskArgs.method, taskArgs.args, taskArgs.network);
    console.log(`Result: ${result}`);
  });