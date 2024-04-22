import path from 'path';
import fs from 'fs';

export function getArtelaConfig(network: string = 'artela'): { nodeUrl: string; privateKey: string | null } {
    const baseDir = process.cwd();
    const configPath = path.join(baseDir, 'hardhat.config.js');
    if (!fs.existsSync(configPath)) {
      console.log("hardhat.config.js does not exist. Please create it.");
      process.exit(0);
    }
    const config = require(configPath);
    const networkConfig = config.networks[network];
    if (!networkConfig) {
      console.log(`Network ${network} is not configured in hardhat.config.js. Please set it.`);
      process.exit(0);
    }
    const nodeUrl = networkConfig.url;
    if (!nodeUrl) {
      console.log(`Node URL for network ${network} is not configured in hardhat.config.js. Please set it.`);
      process.exit(0);
    }
    const accounts = networkConfig.accounts;
    if (!accounts) {
      console.log(`Accounts for network ${network} are not configured in hardhat.config.js. Please set them.`);
      return { nodeUrl, privateKey: null };
    }
    if (!Array.isArray(accounts) || accounts.length < 1) {
        console.log("Accounts are not configured in hardhat.config.js. Please set them.");
        return { nodeUrl, privateKey: null };
    }
    const privateKey = accounts[0];
    return { nodeUrl, privateKey };
  }

export function getExplorerUrl(txHash: string, network: string = 'artela'): null | string{
    if (network === 'artela') {
      return `https://betanet-scan.artela.network/tx/${txHash}`;
    }
    return null;
}