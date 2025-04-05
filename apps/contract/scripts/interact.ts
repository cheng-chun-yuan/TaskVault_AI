import { parseEther, formatEther, keccak256, encodePacked } from 'viem';
import hre from 'hardhat';
import 'dotenv/config';
import {
    loadDeploymentRecords,
    setupClients,
    VerificationConfig,
} from './helper';
import { hashEndpointWithScope } from '@selfxyz/core';
import { countries, getPackedForbiddenCountries } from "@selfxyz/core";

interface Contracts {
    taskVaultCore: any;
    submissionRegistry: any;
    prizeVault: any;
    mockToken?: any;
}

async function loadContracts(network: string): Promise<{ contracts: Contracts; verificationConfig: VerificationConfig }> {
    const deployments = loadDeploymentRecords();
    const networkDeployments = deployments.networks[network];

    if (!networkDeployments) {
        throw new Error(`No deployments found for network: ${network}`);
    }

    const TaskVaultCoreArtifact = await hre.artifacts.readArtifact('TaskVaultCore');
    const SubmissionRegistryArtifact = await hre.artifacts.readArtifact('SubmissionRegistry');
    const PrizeVaultArtifact = await hre.artifacts.readArtifact('PrizeVault');

    // Convert serialized config back to VerificationConfig
    const verificationConfig: VerificationConfig = {
        scope: BigInt(networkDeployments.config.verificationConfig.scope),
        attestationId: BigInt(networkDeployments.config.verificationConfig.attestationId),
        olderThanEnabled: networkDeployments.config.verificationConfig.olderThanEnabled,
        olderThan: BigInt(networkDeployments.config.verificationConfig.olderThan),
        forbiddenCountriesEnabled: networkDeployments.config.verificationConfig.forbiddenCountriesEnabled,
        forbiddenCountriesListPacked: networkDeployments.config.verificationConfig.forbiddenCountriesListPacked.map(n => BigInt(n)) as [bigint, bigint, bigint, bigint],
        ofacEnabled: networkDeployments.config.verificationConfig.ofacEnabled
    };

    return {
        contracts: {
            taskVaultCore: {
                address: networkDeployments.contracts.TaskVaultCore,
                abi: TaskVaultCoreArtifact.abi
            },
            submissionRegistry: {
                address: networkDeployments.contracts.SubmissionRegistry,
                abi: SubmissionRegistryArtifact.abi
            },
            prizeVault: {
                address: networkDeployments.contracts.PrizeVault,
                abi: PrizeVaultArtifact.abi
            },
            ...(networkDeployments.contracts.ERC20Mock && {
                mockToken: {
                    address: networkDeployments.contracts.ERC20Mock,
                    abi: (await hre.artifacts.readArtifact('ERC20Mock')).abi
                }
            })
        },
        verificationConfig
    };
}


function getVerificationConfig(taskId: bigint): VerificationConfig {
    const scopeName = 'trustjudge-ai';
    const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify/${Number(taskId)}`;
    const scope = hashEndpointWithScope(endpoint, scopeName);
    
    const excludedCountries = [
        countries.IRAN,
        countries.IRAQ,
        countries.NORTH_KOREA,
        countries.RUSSIA,
        countries.SYRIAN_ARAB_REPUBLIC,
        countries.VENEZUELA
    ];
    const packed = getPackedForbiddenCountries(excludedCountries);

    return {
        scope: BigInt(scope),
        attestationId: 1n,
        olderThanEnabled: true,
        olderThan: 18n,
        forbiddenCountriesEnabled: true,
        forbiddenCountriesListPacked: packed.map(n => BigInt(n)) as [bigint, bigint, bigint, bigint],
        ofacEnabled: [true, false, false]
    };
}

async function main() {
    if (!process.env.PRIVATE_KEY) throw new Error('❌ PRIVATE_KEY not set');

    const { network } = hre;
    const { walletClient, publicClient, deployerAddress } = setupClients(
        network.name,
        process.env.PRIVATE_KEY
    );

    console.log(`🔗 Connecting to contracts on ${network.name} as ${deployerAddress}`);

    // Load deployed contracts and config
    const { contracts } = await loadContracts(network.name);
    // Get Test Token
    async function getTestToken(
        amount: bigint
    ) {
        if (!contracts.mockToken) return;
        const hash = await walletClient.writeContract({
            ...contracts.mockToken,
            functionName: 'mint',
            args: [deployerAddress, amount]
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`✅ Minted ${formatEther(amount)} to ${deployerAddress} with Hash:${hash}`);
    }

    // Example interactions
    async function createTask(
        criteria: string[],
        styleCommit: `0x${string}`,
        deadline: number,
        prizeAmount: bigint,
        verificationConfig: VerificationConfig,
        maxPerTime: bigint,
        maxPerDay: bigint
    ) {
        console.log('Creating new task...');

        // Approve token if using mock
        if (contracts.mockToken) {
            const hash = await walletClient.writeContract({
                ...contracts.mockToken,
                functionName: 'approve',
                args: [contracts.taskVaultCore.address, prizeAmount]
            });
            await publicClient.waitForTransactionReceipt({ hash });
            console.log(`✅ Token approved to ${contracts.taskVaultCore.address} with ${hash}`);
        }

        // Create task with verification config
        const hash = await walletClient.writeContract({
            ...contracts.taskVaultCore,
            functionName: 'createTask',
            args: [
                criteria,
                styleCommit,
                BigInt(deadline),
                contracts.mockToken?.address || '0x0000000000000000000000000000000000000000',
                prizeAmount,
                verificationConfig.scope,
                verificationConfig.attestationId,
                verificationConfig.olderThanEnabled,
                verificationConfig.olderThan,
                verificationConfig.forbiddenCountriesEnabled,
                verificationConfig.forbiddenCountriesListPacked,
                verificationConfig.ofacEnabled,
                maxPerTime,
                maxPerDay
            ]
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`✅ Task created: ${hash}`);
        return receipt;
    }

    async function submitSolution(taskId: bigint, contentHash: string) {
        console.log(`Submitting solution for task ${taskId}...`);
        const hash = await walletClient.writeContract({
            ...contracts.submissionRegistry,
            functionName: 'submit',
            args: [taskId, contentHash]
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`✅ Solution submitted: ${hash}`);
    }

    async function revealStyle(taskId: bigint, style: string, salt: string) {
        console.log(`Revealing style for task ${taskId}...`);
        const hash = await walletClient.writeContract({
            ...contracts.taskVaultCore,
            functionName: 'revealStyle',
            args: [taskId, style, salt]
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`✅ Style revealed: ${hash}`);
    }

    // Example usage
    try {
        // Create a new task
        const criteria = ['aa'];
        const style = "so cool"
        const salt = "XueDAO"
        const styleCommit = keccak256(
            encodePacked(['string', 'string'], [style, salt])
        );
        const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
        const prizeAmount = parseEther('100');

        const verificationConfig = getVerificationConfig(0n);

        const maxPerTime = 10n;
        const maxPerDay = 100n;

        // Get verification config from deployments
        console.log('Using verification config:', verificationConfig);

        // await getTestToken(prizeAmount);
        await createTask(
            criteria,
            styleCommit,
            deadline,
            prizeAmount,
            verificationConfig,
            maxPerTime,
            maxPerDay
        );

        // Submit a solution
        await submitSolution(0n, 'QmYourIPFSHash');

        // Reveal style
        // await revealStyle(0n, style, salt);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main().catch((err) => {
    console.error('❌ Interaction failed:', err);
    process.exit(1);
});