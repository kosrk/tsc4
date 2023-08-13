import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Task5 } from '../wrappers/Task5';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task5', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task5');
    });

    let blockchain: Blockchain;
    let task5: SandboxContract<Task5>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task5 = blockchain.openContract(Task5.createFromConfig({}, code));

        await blockchain.setVerbosityForAddress(task5.address, {
            blockchainLogs: false,
            vmLogs: 'vm_logs_full',
        });

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task5.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task5.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task5 are ready to use
    });

    it('big case', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(
            BigInt(201),
            BigInt(4),
        );
        expect(out.remaining).toEqual(4);
        expect(out.readBigNumber()).toEqual(453973694165307953197296969697410619233826n);
        expect(out.readBigNumber()).toEqual(734544867157818093234908902110449296423351n);
        expect(out.readBigNumber()).toEqual(1188518561323126046432205871807859915657177n);
        expect(out.readBigNumber()).toEqual(1923063428480944139667114773918309212080528n);
        console.log(gasUsed);
    });

    it('n=0', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(
            BigInt(0),
            BigInt(3),
        );
        expect(out.remaining).toEqual(3);
        expect(out.readBigNumber()).toEqual(0n);
        expect(out.readBigNumber()).toEqual(1n);
        expect(out.readBigNumber()).toEqual(1n);
        console.log(gasUsed);
    });

    it('n=1', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(
            BigInt(1),
            BigInt(3),
        );
        expect(out.remaining).toEqual(3);
        expect(out.readBigNumber()).toEqual(1n);
        expect(out.readBigNumber()).toEqual(1n);
        expect(out.readBigNumber()).toEqual(2n);
        console.log(gasUsed);
    });

    it('n=2', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(
            BigInt(2),
            BigInt(3),
        );
        expect(out.remaining).toEqual(3);
        expect(out.readBigNumber()).toEqual(1n);
        expect(out.readBigNumber()).toEqual(2n);
        expect(out.readBigNumber()).toEqual(3n);
        console.log(gasUsed);
    });

    it('n=3', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(
            BigInt(3),
            BigInt(3),
        );
        expect(out.remaining).toEqual(3);
        expect(out.readBigNumber()).toEqual(2n);
        expect(out.readBigNumber()).toEqual(3n);
        expect(out.readBigNumber()).toEqual(5n);
        console.log(gasUsed);
    });

    it('gas test', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(
            BigInt(350),
            BigInt(1),
        );
        expect(out.remaining).toEqual(1);
        console.log(gasUsed);
    });

    it('max N test', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(
            BigInt(370),
            BigInt(1),
        );
        expect(out.remaining).toEqual(1);
        console.log(gasUsed);
    });

    it('max K test', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(
            BigInt(116),
            BigInt(255),
        );
        expect(out.remaining).toEqual(255);
        console.log(gasUsed);
    });

    it('zero K test', async () => {
        const { out, gasUsed} = await task5.getFibonacciSequence(
            BigInt(370),
            BigInt(0),
        );
        expect(out.remaining).toEqual(0);
        console.log(gasUsed);
    });

});
