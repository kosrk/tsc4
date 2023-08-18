import {Blockchain, printTransactionFees, SandboxContract} from '@ton-community/sandbox';
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

        await blockchain.setVerbosityForAddress(task1.address, {
            blockchainLogs: false,
            vmLogs: 'vm_logs_full',
        });

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
    const extraCell = Cell.fromBase64('te6ccgECQgEAAUUAAwABAQIDAAMDAwACCAMABAQEAwAFBQUDAAYGBgMABwcHAwAICAgDAAkJCQMACgoKAwALCwsDAAwMDAMADQ0NAwAODg4DAA8PDwMAEBAQAwAREREDABISEgMAExMTAwAUFBQDABUVFQMAFhYWAwAXFxcDABgYGAMAGRkZAwAaGhoDABsbGwMAHBwcAwAdHR0DAB4eHgMAHx8fAwAgICADACEhIQMAIiIiAwAjIyMDACQkJAMAJSUlAwAmJiYDACcnJwMAKCgoAwApKSkDACoqKgMAKysrAwAsLCwDAC0tLQMALi4uAwAvLy8DADAwMAMAMTExAwAyMjIDADMzMwMANDQ0AwA1NTUDADY2NgMANzc3AwA4ODgDADk5OQMAOjo6AwA7OzsDADw8PAMAPT09AwA+Pj4DAD8/PwMAQEBAAwBBQUEAAA==')

    it('base case', async () => {
        const { out, gasUsed} = await task1.getFindBranchByHash(
            BigInt('0xad7c13af417efb2334a10528e61e5620d74d486a62052654ac3c148abf6f6eab'),
            baseCell
        );
        expect(out.bits.length).toEqual(16);
        // expect(gasUsed).toEqual(1230n);
        console.log('Gas used: ', gasUsed);

    });

    it('extra case', async () => {
        const { out, gasUsed} = await task1.getFindBranchByHash(
            BigInt(112217716449989047460221684632076053244058804272382489846864958003834180757136n),
            extraCell
        );
        expect(out.hash().toString('hex')).toEqual("f818fa08b955b4796cf7c7ce7b627763efd83fdac35f71cd7688165ab50e6690");
        // expect(gasUsed).toEqual(1230n);
        console.log('Gas used: ', gasUsed);

    });

    it('not find case', async () => {
        const { out, gasUsed} = await task1.getFindBranchByHash(
            404n,
            baseCell
        );
        expect(out.bits.length).toEqual(0);
        // expect(gasUsed).toEqual(3039n);
        console.log('Gas used: ', gasUsed);
    });

});
