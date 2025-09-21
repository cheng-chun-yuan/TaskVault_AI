"use client";

import Link from "next/link";
import { shorten } from "@/lib/utils";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@workspace/ui/components/button";
import { useProfile, useDisplayName } from "@/stores/userStore";
import { useNotification } from "@/context";
import { Badge } from "@workspace/ui/components/badge";
import { Bell, User, Wallet, Trophy, Calendar, LogOut, Twitter, Shield } from "lucide-react";
import { Logo } from "@/components/task/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

export default function AppHeader() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const profile = useProfile();
  const displayName = useDisplayName();
  const { unreadCount } = useNotification();

  return (
    <header className="border-b shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo / Title */}
        <Link href="/" className="flex items-center">
          <Logo width={120} height={120} className="h-16 w-auto" />
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
                Login
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
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {profile ? (
                    <>
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{displayName}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {profile.address?.slice(0, 6)}...{profile.address?.slice(-4)}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem disabled>
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Reputation: {profile.reputation}</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem disabled>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Tasks Created: {profile.tasksCreated}</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem disabled>
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Tasks Completed: {profile.tasksCompleted}</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem disabled>
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Total Earned: {profile.totalEarned} ETH</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                    </>
                  ) : (
                    <>
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Loading profile...</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* Twitter Verification */}
                  <DropdownMenuItem asChild>
                    <Link href="/twitter" className="flex items-center">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center">
                          <Twitter className="mr-2 h-4 w-4 text-blue-500" />
                          <Shield className="h-3 w-3 text-green-500" />
                        </div>
                        <span>Verify Twitter Ownership</span>
                      </div>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        ZK Proof
                      </Badge>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Wallet Selection */}
                  {wallets.length > 0 && (
                    <>
                      <DropdownMenuLabel>Connected Wallets</DropdownMenuLabel>
                      {wallets.map((wallet) => (
                        <DropdownMenuItem
                          key={wallet.address}
                          onClick={() => setActiveWallet(wallet)}
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          <span>{shorten(wallet.address)}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Theme toggle */}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
