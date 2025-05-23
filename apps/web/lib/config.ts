import { http } from 'wagmi'
// Make sure to import `createConfig` from `@privy-io/wagmi`, not `wagmi`
import {createConfig} from '@privy-io/wagmi';
import { celoAlfajores, sepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [sepolia, celoAlfajores], // Pass your required chains as an array
  transports: {
    [sepolia.id]: http(),
    [celoAlfajores.id]: http(),
    // For each of your required chains, add an entry to `transports` with
    // a key of the chain's `id` and a value of `http()`
  },
});