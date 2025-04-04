import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { keccak256, toBytes, type Hash, type Address } from "viem"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateStyleHash = (criteria: string[], judgeStyle: string, salt: string): Hash => {
  // Concatenate all criteria with a delimiter
  const criteriaString = criteria.join('|')
  
  // Create the message to hash
  const message = `${criteriaString}:${judgeStyle}:${salt}`
  
  // Use keccak256 for Ethereum compatible hashing
  return keccak256(toBytes(message))
}

export type TaskData = {
  title: string
  criteria: string[]
  judgeStyle: string
  salt: string
  deadline: Date
  tokenAddress: Address
  amount: string
  styleCommit?: Hash
  creatorAddress: Address
}

export const shorten = (address: string | undefined) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}`;
};
