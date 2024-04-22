#!/bin/bash

if [ -d "aspect" ]; then
    echo "Directory 'aspect' already exists. Ignoring..."
else
    mkdir aspect
    cat << EOF > aspect/tsconfig.json
{
    "extends": "assemblyscript/std/assembly.json",
    "include": [
        "./**/*.ts"
    ]
}
EOF    
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
    echo "Directory 'aspect' created."
fi

if [ ! -f .env ]; then
    echo "PRIVATEKEY=YOURPRIVATEKEY" >> .env
    echo "PRIVATEKEY_LOCAL=0x7b13c9f33b3b5663700297471733a88796fccc33b0da8e9b813f7a8422533304" >> .env
    echoi "File '.env' created."
fi