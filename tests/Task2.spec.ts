import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import {Cell, toNano, Tuple, TupleBuilder, TupleItem} from 'ton-core';
import { Task2 } from '../wrappers/Task2';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task2', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task2');
    });

    let blockchain: Blockchain;
    let task2: SandboxContract<Task2>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task2 = blockchain.openContract(Task2.createFromConfig({}, code));

        await blockchain.setVerbosityForAddress(task2.address, {
            blockchainLogs: false,
            vmLogs: 'vm_logs_full',
        });

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task2.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task2.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task2 are ready to use
    });

    it('base case', async () => {
        const { out, gasUsed} = await task2.getMatrixMultiplier(
            {type: 'tuple', items: [
                { type: 'tuple', items: [
                        {type: 'int', value: BigInt(1)},
                        {type: 'int', value: BigInt(2)},
                    ]
                },
                    { type: 'tuple', items: [
                            {type: 'int', value: BigInt(3)},
                            {type: 'int', value: BigInt(4)},
                        ]
                    },
                ]},

            {type: 'tuple', items: [
                    { type: 'tuple', items: [
                            {type: 'int', value: BigInt(1)},
                            {type: 'int', value: BigInt(2)},
                        ]
                    },
                    { type: 'tuple', items: [
                            {type: 'int', value: BigInt(3)},
                            {type: 'int', value: BigInt(4)},
                        ]
                    },
                ]},
        );

        let t1 = out.readTuple();
        let t2 = out.readTuple();
        expect(t1.readBigNumber()).toEqual(7n);
        expect(t1.readBigNumber()).toEqual(10n);
        expect(t2.readBigNumber()).toEqual(15n);
        expect(t2.readBigNumber()).toEqual(22n);

        console.log('Gas used: ', gasUsed);

    });

});
