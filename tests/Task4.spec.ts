import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import {beginCell, Cell, toNano} from 'ton-core';
import { Task4 } from '../wrappers/Task4';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task4', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task4');
    });

    let blockchain: Blockchain;
    let task4: SandboxContract<Task4>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task4 = blockchain.openContract(Task4.createFromConfig({}, code));

        await blockchain.setVerbosityForAddress(task4.address, {
            blockchainLogs: false,
            vmLogs: 'vm_logs_full',
        });

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task4.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task4.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task4 are ready to use
    });

    it('encrypt', async () => {
        const inputCell = beginCell()
            .storeUint(0, 32)
            .storeStringTail('blah12345677!@#$#^&*(~SGAfjsfhsfjsafhsdDSHAKGHSAFGHFGJJSHFJFsfgfhagfhsgfhgshfgGSHFAHGFHSGHsaffsdasfsafsafAGFYWGYFGwygsgdsgdgYWDGWYAg34362573258uhgashffsgghjcbvhshbhjgfagfhsagghgfhasgdwreytwryargfhasgfghjasgfvchsagfhasgfhsgfhagfhasgfsahghajkghsjagdhagsywteywatrgwfsagf')
            .endCell();

        const outputCell = beginCell()
            .storeUint(0, 32)
            .storeStringTail('eodk12345677!@#$#^&*(~VJDimvikvimvdikvgGVKDNJKVDIJKIJMMVKIMIvijikdjikvjikjvkijJVKIDKJIKVJKvdiivgdvivdivdiDJIBZJBIJzbjvjgvjgjBZGJZBDj34362573258xkjdvkiivjjkmfeykvkekmjidjikvdjjkjikdvjgzuhbwzubdujikdvjijkmdvjiyfkvdjikdvjikvjikdjikdvjivdkjkdmnjkvmdjgkdjvbzwhbzdwujzivdji')
            .endCell();

        const res = await
            task4.getCaesarCipherEncrypt(BigInt(3), inputCell);
        expect(res.out).toEqualCell(outputCell)
        console.log('Gas used: ', res.gasUsed);
    });

    it('decrypt', async () => {
        const inputCell = beginCell()
            .storeUint(0, 32)
            .storeStringTail('eodk12345677!@#$#^&*(~VJDimvikvimvdikvgGVKDNJKVDIJKIJMMVKIMIvijikdjikvjikjvkijJVKIDKJIKVJKvdiivgdvivdivdiDJIBZJBIJzbjvjgvjgjBZGJZBDj34362573258xkjdvkiivjjkmfeykvkekmjidjikvdjjkjikdvjgzuhbwzubdujikdvjijkmdvjiyfkvdjikdvjikvjikdjikdvjivdkjkdmnjkvmdjgkdjvbzwhbzdwujzivdji')
            .endCell();

        const outputCell = beginCell()
            .storeUint(0, 32)
            .storeStringTail('blah12345677!@#$#^&*(~SGAfjsfhsfjsafhsdDSHAKGHSAFGHFGJJSHFJFsfgfhagfhsgfhgshfgGSHFAHGFHSGHsaffsdasfsafsafAGFYWGYFGwygsgdsgdgYWDGWYAg34362573258uhgashffsgghjcbvhshbhjgfagfhsagghgfhasgdwreytwryargfhasgfghjasgfvchsagfhasgfhsgfhagfhasgfsahghajkghsjagdhagsywteywatrgwfsagf')
            .endCell();

        const res = await
            task4.getCaesarCipherDecrypt(BigInt(3), inputCell);
        expect(res.out).toEqualCell(outputCell)
        console.log('Gas used: ', res.gasUsed);
    });

});
