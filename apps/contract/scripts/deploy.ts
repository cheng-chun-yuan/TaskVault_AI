import { parseEther, zeroAddress } from 'viem';
import hre from 'hardhat';
import 'dotenv/config';
import {
  ContractArtifact,
  saveContractAddress,
  setupClients,
  saveVerificationConfig,
  getDefaultVerificationConfig
} from './helper';

async function main() {

  if (!process.env.PRIVATE_KEY) throw new Error('❌ PRIVATE_KEY not set');

  const { network } = hre;
  const { walletClient, publicClient, deployerAddress } = setupClients(
    network.name,
    process.env.PRIVATE_KEY
  );

  console.log(`🚀 Deploying contracts to ${network.name} as ${deployerAddress}`);

  // 🏗 Deploy TaskVaultCore
  const TaskVaultCoreArtifact = (await hre.artifacts.readArtifact('TaskVaultCore')) as ContractArtifact;
  const taskVaultHash = await walletClient.deployContract({
    abi: TaskVaultCoreArtifact.abi,
    bytecode: TaskVaultCoreArtifact.bytecode as `0x${string}`,
    args: [deployerAddress], // judge address
  });
  console.log(`📤 TaskVaultCore tx sent: ${taskVaultHash}`);
  const taskVaultReceipt = await publicClient.waitForTransactionReceipt({ hash: taskVaultHash });
  const taskVaultAddress = taskVaultReceipt.contractAddress!;
  console.log(`✅ TaskVaultCore deployed at: ${taskVaultAddress}`);
  saveContractAddress(network.name, 'TaskVaultCore', taskVaultAddress);

  // 🧠 Deploy SubmissionRegistry
  const SubmissionRegistryArtifact = (await hre.artifacts.readArtifact('SubmissionRegistry')) as ContractArtifact;
  const identityHubAddress = process.env.IDENTITY_HUB || zeroAddress;
  const submissionHash = await walletClient.deployContract({
    abi: SubmissionRegistryArtifact.abi,
    bytecode: SubmissionRegistryArtifact.bytecode as `0x${string}`,
    args: [deployerAddress, taskVaultAddress, identityHubAddress], // oracle, taskCore, identityHub
  });
  console.log(`📤 SubmissionRegistry tx sent: ${submissionHash}`);
  const submissionReceipt = await publicClient.waitForTransactionReceipt({ hash: submissionHash });
  const submissionAddress = submissionReceipt.contractAddress!;
  console.log(`✅ SubmissionRegistry deployed at: ${submissionAddress}`);
  saveContractAddress(network.name, 'SubmissionRegistry', submissionAddress);

  // 🔗 Set SubmissionRegistry in TaskVaultCore
  const setSubmissionHash = await walletClient.writeContract({
    address: taskVaultAddress,
    abi: TaskVaultCoreArtifact.abi,
    functionName: 'setSubmissionRegistry',
    args: [submissionAddress],
  });
  console.log(`📤 Setting SubmissionRegistry tx sent: ${setSubmissionHash}`);
  await publicClient.waitForTransactionReceipt({ hash: setSubmissionHash });
  console.log(`✅ SubmissionRegistry set in TaskVaultCore`);

  // 🏗 Deploy PrizeVault
  const PrizeVaultArtifact = (await hre.artifacts.readArtifact('PrizeVault')) as ContractArtifact;
  const prizeVaultHash = await walletClient.deployContract({
    abi: PrizeVaultArtifact.abi,
    bytecode: PrizeVaultArtifact.bytecode as `0x${string}`,
    args: [taskVaultAddress],
  });
  console.log(`📤 PrizeVault tx sent: ${prizeVaultHash}`);
  const prizeVaultReceipt = await publicClient.waitForTransactionReceipt({ hash: prizeVaultHash });
  const prizeVaultAddress = prizeVaultReceipt.contractAddress!;
  console.log(`✅ PrizeVault deployed at: ${prizeVaultAddress}`);
  saveContractAddress(network.name, 'PrizeVault', prizeVaultAddress);

  // Set PrizeVault in TaskVaultCore
  const setPrizeVaultHash = await walletClient.writeContract({
    address: taskVaultAddress,
    abi: TaskVaultCoreArtifact.abi,
    functionName: 'setPrizeVault',
    args: [prizeVaultAddress],
  });
  await publicClient.waitForTransactionReceipt({ hash: setPrizeVaultHash });
  console.log(`✅ Set PrizeVault in TaskVaultCore`);

  // Save default verification config
  const defaultConfig = getDefaultVerificationConfig();
  saveVerificationConfig(network.name, defaultConfig);
  console.log(`✅ Default verification config saved`);

  // 💰 Optional: Deploy ERC20Mock
  if (process.env.DEPLOY_MOCK === 'true') {
    const ERC20MockArtifact = (await hre.artifacts.readArtifact('ERC20Mock')) as ContractArtifact;
    const tokenHash = await walletClient.deployContract({
      abi: ERC20MockArtifact.abi,
      bytecode: ERC20MockArtifact.bytecode as `0x${string}`,
      args: ['MockToken', 'MOCK', deployerAddress, parseEther('100000')],
    });
    const tokenReceipt = await publicClient.waitForTransactionReceipt({ hash: tokenHash });
    const tokenAddress = tokenReceipt.contractAddress!;
    console.log(`🪙 ERC20Mock deployed at: ${tokenAddress}`);
    saveContractAddress(network.name, 'ERC20Mock', tokenAddress);

    // Approve token in TaskVaultCore
    const approveTokenHash = await walletClient.writeContract({
      address: taskVaultAddress,
      abi: TaskVaultCoreArtifact.abi,
      functionName: 'approvePrizeToken',
      args: [tokenAddress],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveTokenHash });
    console.log(`✅ Approved ERC20Mock in TaskVaultCore`);
  }
}

main().catch((err) => {
  console.error('❌ Deployment failed:', err);
  process.exit(1);
});