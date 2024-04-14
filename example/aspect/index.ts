import {
    allocate,
    entryPoint,
    execute,
    IPreContractCallJP,
    PreContractCallInput,
    sys,
    uint8ArrayToHex,
    hexToUint8Array,
    uint8ArrayToBool
} from '@artela/aspect-libs';

class PermitAspect
    implements IPreContractCallJP {

    isOwner(sender: Uint8Array): bool {
        return true
    }

    getSpenderAddress(input: PreContractCallInput): Uint8Array {
        sys.log(input.call!.data.toString())
        return input.call!.data.slice(48, 68);
    }

    preContractCall(input: PreContractCallInput): void {
        sys.log("preContractCall start");
        const spenderBytes = this.getSpenderAddress(input);
        const spenderAddress = "0x" + uint8ArrayToHex(spenderBytes);
        sys.log("spenderAddress: " + spenderAddress);
        let size = uint8ArrayToBool(sys.hostApi.stateDb.codeHash(spenderBytes));  
        if(!size) {
            sys.log("Invalid spender address");
            sys.revert("Invalid spender address");
            return;
        }
    }
}

// 2.register aspect Instance
const aspect = new PermitAspect();
entryPoint.setAspect(aspect);
// 3.must export it
export {execute, allocate};