#!/bin/bash
if [ ! -d aspect ]; then
    mkdir aspect
    cat << EOF > aspect/tsconfig.json
{
    "extends": "assemblyscript/std/assembly.json",
    "include": [
        "./**/*.ts"
    ]
}
EOF
    echo "Directory 'aspect' created."
fi

if [ ! -f aspect/index.ts ]; then
    cat << EOF > aspect/index.ts
import {
    allocate,
    entryPoint,
    ethereum,
    execute,
    IPostTxExecuteJP,
    IPreTxExecuteJP,
    PostTxExecuteInput,
    PreTxExecuteInput,
    sys,BytesData,
    uint8ArrayToHex,
} from '@artela/aspect-libs';
import {Protobuf} from "as-proto/assembly";
class StoreAspect
    implements IPostTxExecuteJP, IPreTxExecuteJP {
    isOwner(sender: Uint8Array): bool {
        return true
    }

    preTxExecute(input: PreTxExecuteInput): void {
        //for smart contract call
        sys.aspect.transientStorage.get<string>('ToContract').set<string>('HelloWorld');
    }

    postTxExecute(input: PostTxExecuteInput): void {
        const to = uint8ArrayToHex(input.tx!.to);
        let txData = sys.hostApi.runtimeContext.get("tx.data");
        const txDataPt = Protobuf.decode<BytesData>(txData, BytesData.decode);
        const parentCallMethod = ethereum.parseMethodSig(txDataPt.data);
        const value = sys.aspect.transientStorage.get<string>('ToAspect', to).unwrap();
        // setAspectContext method signature value is `9cf3ef1e`
        if(parentCallMethod=="9cf3ef1e") {
            //'HelloAspect' here is set from smart contract
            sys.require(value == "HelloAspect", "failed to get value by contract setting.");
        }
    }

}

// 2.register aspect Instance
const aspect = new StoreAspect();
entryPoint.setAspect(aspect);

// 3.must export it
export {execute, allocate};
EOF
fi

if [ ! -f .env ]; then
    echo "PRIVATEKEY=YOURPRIVATEKEY" >> .env
    echo "PRIVATEKEY_LOCAL=0x7b13c9f33b3b5663700297471733a88796fccc33b0da8e9b813f7a8422533304" >> .env
    echoi "File '.env' created."
fi

if [ ! -f contracts/Storage.sol ]; then
    cat << EOF > contracts/Storage.sol
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

/**
* @title Storage
* @dev Store & retrieve value in a variable
*/
contract Storage {
    address private deployer;

    constructor() {
        deployer = msg.sender;
    }

    function isOwner(address user) external view returns (bool result) {
        if (user == deployer) {
            return true;
        } else {
            return false;
        }
    }

    function getAspectContext(address aspectId, string calldata key) public returns (string memory validationData) {
        bytes memory contextKey = abi.encodePacked(aspectId, key);
        (bool success, bytes memory returnData) = address(0x64).call(contextKey);
        validationData = success ? string(returnData) : '';
    }

    function setAspectContext(string calldata key, string calldata value) public returns (bool) {
        bytes memory contextKey = abi.encode(key, value);
        (bool success,) = address(0x66).call(contextKey);
        return success;
    }
}
EOF

 echo "File contracts/Storage.sol created."
fi

if [ ! -d scripts ]; then
        mkdir scripts
        echo "Directory 'scripts' created."
fi

if [ ! -f scripts/deploy.ts ]; then
        cat << EOF > scripts/deploy.ts
const hre = require("hardhat");

import { bindAspect, deployAspect, getBoundAddress, getBoundAspect } from "artela-hardhat-plugin/src/internal/aspect";

async function testContract(contractAddress: string, aspectId: string) {
    const Contract = await hre.ethers.getContractAt("Storage", contractAddress);
    console.log("Get the aspect context");
    let validationData = await Contract.getAspectContext.staticCall(aspectId, "ToContract");
    console.log('getAspectContext response:', validationData);
    // Call the setAspectContext method
    const response = await Contract.setAspectContext.staticCall("ToAspect", "HelloAspect");
    console.log('setAspectContext response:', response);
}

async function main() {
    const network = hre.network.name;
    const Storage = await hre.ethers.getContractFactory("Storage");
    console.log("start deploy")
    const token = await Storage.deploy({ gasLimit: 9000000 });
    await token.waitForDeployment();
    const contractAddress = await token.getAddress();
    console.log("deployed contract", contractAddress);
    const aspect = await deployAspect("[]", ["preTxExecute", "postTxExecute"], "build/index_debug.wasm", "", network);
    const bind = await bindAspect(contractAddress, aspect, "9000000", network);
    console.log("deployed aspect", aspect, "contract: ", contractAddress);
    // const boundAddress = await getBoundAddress(aspect, network);
    // const boundAspect = await getBoundAspect(contractAddress, network);
    await testContract(contractAddress, aspect);
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

EOF
        echo "File scripts/deploy.ts created."
fi

if [ ! -d test ]; then
        mkdir test
        echo "Directory 'test' created."
fi

if [ ! -f test/Storage.ts ]; then
        cat << EOF > test/Storage.ts
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Storage", function () {
    let Storage;
    let storage: any;

    beforeEach(async function () {
        Storage = await ethers.getContractFactory("Storage");
        storage = await Storage.deploy({ gasLimit: 9000000 });
        await storage.waitForDeployment();
    });

    it("Should return the right owner", async function () {
        const [owner] = await ethers.getSigners();
        expect(await storage.isOwner(owner.address)).to.equal(true);
    });

    it("Should return false if not the owner", async function () {
        const [, nonOwner] = await ethers.getSigners();
        expect(await storage.isOwner(nonOwner.address)).to.equal(false);
    });
});
EOF
        echo "File test/Storage.ts created."
fi