import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano, beginCell } from 'ton-core';
import { Task3 } from '../wrappers/Task3';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task3', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task3');
    });

    let blockchain: Blockchain;
    let task3: SandboxContract<Task3>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task3 = blockchain.openContract(Task3.createFromConfig({}, code));

        await blockchain.setVerbosityForAddress(task3.address, {
            blockchainLogs: false,
            vmLogs: 'vm_logs_full',
        });

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task3.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task3.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task3 are ready to use
    });

//           1011 10101
// ...10100001011 10101000111111...
//           1111 11111
// ...10100001111 11111000111111...

    it('basic case', async () => {
        const inputCell = beginCell()
            .storeUint(0b10100001011, 11)
            .storeRef(
                beginCell()
                    .storeUint(0b10101000111111, 14).endCell()
            )
            .endCell();

        const outputCell = beginCell()
            .storeUint(0b10100001111, 11)
            .storeUint(0b11111000111111, 14).endCell();

        const res = await
            task3.getFindAndReplace(BigInt(0b101110101), BigInt(0b111111111), inputCell);
        expect(res.out).toEqualCell(outputCell)
    });
});
