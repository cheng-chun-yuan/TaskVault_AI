"use client";

import Link from "next/link";
import { shorten } from "@/lib/utils";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@workspace/ui/components/button";
import { useUser, useNotification } from "@/context";
import { Badge } from "@workspace/ui/components/badge";
import { Bell } from "lucide-react";

export default function AppHeader() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { profile, getDisplayName } = useUser();
  const { unreadCount } = useNotification();

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
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
              
              {/* User Profile */}
              {profile && (
                <div className="hidden md:flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">{getDisplayName()}</div>
                    <div className="text-xs text-muted-foreground">
                      Rep: {profile.reputation} • Tasks: {profile.tasksCreated}
                    </div>
                  </div>
                </div>
              )}
              
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
