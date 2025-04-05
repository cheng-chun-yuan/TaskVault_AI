import { parseEther, zeroAddress } from 'viem';
import hre from 'hardhat';
import 'dotenv/config';
import {
  ContractArtifact,
  saveContractAddress,
  setupClients,
  saveVerificationConfig,
  getDefaultVerificationConfig,
  loadDeploymentRecords
} from './helper';

async function main() {
  if (!process.env.PRIVATE_KEY) throw new Error('❌ PRIVATE_KEY not set');

  const { network } = hre;
  const { walletClient, publicClient, deployerAddress } = setupClients(
    network.name,
    process.env.PRIVATE_KEY
  );

  // Ensure deployerAddress is defined
  if (!deployerAddress) {
    throw new Error('❌ Deployer address not found. Check setupClients implementation.');
  }

  console.log(`🚀 Deploying contracts to ${network.name} as ${deployerAddress}`);

  const TaskVaultCoreArtifact = (await hre.artifacts.readArtifact('TaskVaultCore')) as ContractArtifact;
  const SubmissionRegistryArtifact = (await hre.artifacts.readArtifact('SubmissionRegistry')) as ContractArtifact;
  const PrizeVaultArtifact = (await hre.artifacts.readArtifact('PrizeVault')) as ContractArtifact;
  const ERC20MockArtifact = (await hre.artifacts.readArtifact('ERC20Mock')) as ContractArtifact;


  // // Get deployed contract addresses
  // const records = loadDeploymentRecords();
  // const contracts = records.networks["celo"]?.contracts;
  // const taskVaultAddress = contracts?.TaskVaultCore as `0x${string}`;
  // const submissionRegistryAddress = contracts?.SubmissionRegistry as `0x${string}`;
  // const prizeVaultAddress = contracts?.PrizeVault as `0x${string}`;

  // 🏗 Deploy TaskVaultCore
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
  const prizeVaultHash = await walletClient.deployContract({
    abi: PrizeVaultArtifact.abi,
    bytecode: PrizeVaultArtifact.bytecode as `0x${string}`,
    args: [taskVaultAddress, deployerAddress],
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

async function verifyContract(address: string, args: any[], contract?: string) {
  console.log(`🔍 Verifying contract ${contract || ''} at ${address}`);
  try {
    await hre.run('verify:verify', {
      address,
      constructorArguments: args,
      contract: contract,
    });
    console.log('✅ Contract verified successfully');
  } catch (err: any) {
    if (err.message.includes('Already Verified')) {
      console.log('✅ Contract already verified');
    } else {
      console.error('❌ Verification failed:', err);
    }
  }
}

async function deployAndVerify() {
  await main();

  // Get deployed contract addresses
  const records = loadDeploymentRecords();
  const network = hre.network.name;
  const contracts = records.networks[network]?.contracts;

  if (!contracts) {
    console.error('❌ No deployment records found');
    return;
  }

  console.log('🔍 Starting contract verification...');

  // Verify TaskVaultCore
  if (contracts.TaskVaultCore) {
    const { deployerAddress } = setupClients(network, process.env.PRIVATE_KEY!);
    await verifyContract(contracts.TaskVaultCore, [deployerAddress]);
  }

  // Verify SubmissionRegistry
  if (contracts.SubmissionRegistry) {
    const { deployerAddress } = setupClients(network, process.env.PRIVATE_KEY!);
    const identityHubAddress = process.env.IDENTITY_HUB || zeroAddress;
    await verifyContract(contracts.SubmissionRegistry, [deployerAddress, contracts.TaskVaultCore, identityHubAddress]);
  }

  // Verify PrizeVault
  if (contracts.PrizeVault) {
    const { deployerAddress } = setupClients(network, process.env.PRIVATE_KEY!);
    await verifyContract(contracts.PrizeVault, [contracts.TaskVaultCore, deployerAddress]);
  }

  // Verify ERC20Mock if deployed
  if (contracts.ERC20Mock) {
    const { deployerAddress } = setupClients(network, process.env.PRIVATE_KEY!);
    await verifyContract(
      contracts.ERC20Mock,
      ['MockToken', 'MOCK', deployerAddress, parseEther('100000')]
    );
  }
}

deployAndVerify().catch((err) => {
  console.error('❌ Deployment or verification failed:', err);
  process.exit(1);
});