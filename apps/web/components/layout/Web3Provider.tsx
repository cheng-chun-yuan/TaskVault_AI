"use client";

import { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/config";
import { privyConfig } from "@/lib/privyConfig";

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider appId="cm8ykdk5v01hcqdbf7vd5gwta" config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
