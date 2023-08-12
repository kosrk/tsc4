import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task1', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task1');
    });

    let blockchain: Blockchain;
    let task1: SandboxContract<Task1>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task1 = blockchain.openContract(Task1.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task1 are ready to use
    });

    const baseCell = Cell.fromBase64('te6ccgEBBAEAEQABBAAGAQEEAAcCAQQABQMAAA==')

    it('base case', async () => {
        const { out, gasUsed} = await task1.getFindBranchByHash(
            BigInt('0xad7c13af417efb2334a10528e61e5620d74d486a62052654ac3c148abf6f6eab'),
            baseCell
        );
        expect(out.bits.length).toEqual(16);
        expect(gasUsed).toEqual(1230n);
    });

    it('not find case', async () => {
        const { out, gasUsed} = await task1.getFindBranchByHash(
            404n,
            baseCell
        );
        expect(out.bits.length).toEqual(0);
        expect(gasUsed).toEqual(3039n);
    });

});
