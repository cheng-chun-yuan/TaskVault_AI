"use client";

import Link from "next/link";
import { shorten } from "@/lib/utils";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@workspace/ui/components/button";

export default function AppHeader() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();

  return (
    <header className="border-b shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo / Title */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono font-bold text-xl">TaskVault AI</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link
            href="/create"
            className="text-sm font-medium hover:text-primary"
          >
            Create Task
          </Link>
          <Link
            href="/tasks"
            className="text-sm font-medium hover:text-primary"
          >
            Browse Tasks
          </Link>

          {/* Auth actions */}
          {ready && !authenticated && (
            <>
              <Button variant="outline" onClick={login}>
                Login with Privy
              </Button>
            </>
          )}

          {ready && authenticated && (
            <>
              <Button variant="destructive" onClick={logout}>
                Logout
              </Button>
              <div className="hidden lg:flex gap-2">
                {wallets.map((wallet) => (
                  <Button
                    key={wallet.address}
                    variant="ghost"
                    onClick={() => setActiveWallet(wallet)}
                  >
                    {shorten(wallet.address)}
                  </Button>
                ))}
              </div>
            </>
          )}

          {/* Theme toggle */}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
