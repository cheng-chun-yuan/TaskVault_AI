import fs from 'fs';
import path from 'path';
import {
  createWalletClient,
  createPublicClient,
  http,
  defineChain,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hashEndpointWithScope } from '@selfxyz/core';

export interface ContractArtifact {
  abi: any[];
  bytecode: string;
}

export interface VerificationConfig {
  scope: bigint;
  attestationId: bigint;
  olderThanEnabled: boolean;
  olderThan: bigint;
  forbiddenCountriesEnabled: boolean;
  forbiddenCountriesListPacked: [bigint, bigint, bigint, bigint];
  ofacEnabled: [boolean, boolean, boolean];
}

interface SerializedVerificationConfig {
  scope: string;
  attestationId: string;
  olderThanEnabled: boolean;
  olderThan: string;
  forbiddenCountriesEnabled: boolean;
  forbiddenCountriesListPacked: [string, string, string, string];
  ofacEnabled: [boolean, boolean, boolean];
}

export interface DeploymentRecord {
  networks: {
    [network: string]: {
      contracts: { [contract: string]: string };
      config: {
        verificationConfig: SerializedVerificationConfig;
      };
      deploymentTime: string;
    };
  };
}

const DEPLOYMENTS_DIR = path.join(__dirname, '../deployments');
const DEPLOYMENTS_FILE = path.join(DEPLOYMENTS_DIR, 'contracts.json');

export function loadDeploymentRecords(): DeploymentRecord {
  if (!fs.existsSync(DEPLOYMENTS_DIR)) fs.mkdirSync(DEPLOYMENTS_DIR);
  if (!fs.existsSync(DEPLOYMENTS_FILE)) return { networks: {} };
  return JSON.parse(fs.readFileSync(DEPLOYMENTS_FILE, 'utf8'));
}

export function saveDeploymentRecords(records: DeploymentRecord) {
  fs.writeFileSync(DEPLOYMENTS_FILE, JSON.stringify(records, null, 2));
  console.log(`📦 Deployment records saved to ${DEPLOYMENTS_FILE}`);
}

export function saveContractAddress(network: string, contract: string, address: string) {
  const records = loadDeploymentRecords();
  if (!records.networks[network]) {
    records.networks[network] = { 
      contracts: {}, 
      config: {
        verificationConfig: serializeVerificationConfig(getDefaultVerificationConfig())
      },
      deploymentTime: new Date().toISOString() 
    };
  }
  records.networks[network].contracts[contract] = address;
  records.networks[network].deploymentTime = new Date().toISOString();
  saveDeploymentRecords(records);
}

function serializeVerificationConfig(config: VerificationConfig): SerializedVerificationConfig {
  return {
    scope: config.scope.toString(),
    attestationId: config.attestationId.toString(),
    olderThanEnabled: config.olderThanEnabled,
    olderThan: config.olderThan.toString(),
    forbiddenCountriesEnabled: config.forbiddenCountriesEnabled,
    forbiddenCountriesListPacked: config.forbiddenCountriesListPacked.map(n => n.toString()) as [string, string, string, string],
    ofacEnabled: config.ofacEnabled
  };
}

function deserializeVerificationConfig(config: SerializedVerificationConfig): VerificationConfig {
  return {
    scope: BigInt(config.scope),
    attestationId: BigInt(config.attestationId),
    olderThanEnabled: config.olderThanEnabled,
    olderThan: BigInt(config.olderThan),
    forbiddenCountriesEnabled: config.forbiddenCountriesEnabled,
    forbiddenCountriesListPacked: config.forbiddenCountriesListPacked.map(n => BigInt(n)) as [bigint, bigint, bigint, bigint],
    ofacEnabled: config.ofacEnabled
  };
}

export function saveVerificationConfig(network: string, config: VerificationConfig) {
  const records = loadDeploymentRecords();
  if (!records.networks[network]) {
    records.networks[network] = { 
      contracts: {}, 
      config: { verificationConfig: serializeVerificationConfig(config) },
      deploymentTime: new Date().toISOString() 
    };
  } else {
    records.networks[network].config = { 
      ...records.networks[network].config,
      verificationConfig: serializeVerificationConfig(config)
    };
  }
  saveDeploymentRecords(records);
}

export function getDefaultVerificationConfig(): VerificationConfig {
  const scope = hashEndpointWithScope("https://novel-rapidly-panda.ngrok-free.app", 'Self-Denver-Birthday');
  // https://novel-rapidly-panda.ngrok-free.app/api/verify/${}
  return {
    scope: 1n,
    attestationId: 1n,
    olderThanEnabled: true,
    olderThan: 18n,
    forbiddenCountriesEnabled: true,
    forbiddenCountriesListPacked: [0n, 0n, 0n, 0n],
    ofacEnabled: [true, false, false]
  };
}

export function setupClients(network: string, privateKey: string) {
  if (!privateKey.startsWith('0x')) privateKey = `0x${privateKey}`;
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  let rpcUrl: string;
  let chainId: number;

  if (network === 'sepolia') {
    rpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` || 'https://1rpc.io/sepolia';
    chainId = 11155111;
  } else if (network === 'celo') {
    rpcUrl = `https://celo-alfajores.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` || 'https://1rpc.io/celo-sepolia';
    chainId = 44787;
  } else {
    throw new Error(`Unsupported network: ${network}`);
  }

  const chain = defineChain({
    id: chainId,
    name: network,
    nativeCurrency: {
      decimals: 18,
      name: 'Native',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: { http: [rpcUrl] },
    },
  });

  return {
    walletClient: createWalletClient({ account, chain, transport: http(rpcUrl) }),
    publicClient: createPublicClient({ chain, transport: http(rpcUrl) }),
    deployerAddress: account.address
  };
}
