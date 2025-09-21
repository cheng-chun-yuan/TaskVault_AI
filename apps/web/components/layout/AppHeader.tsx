"use client";

import Link from "next/link";
import { useState } from "react";
import { shorten } from "@/lib/utils";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@workspace/ui/components/button";
import { useProfile, useDisplayName } from "@/stores/userStore";
import { useNotification } from "@/context";
import { Badge } from "@workspace/ui/components/badge";
import { Bell, User, Wallet, Trophy, Calendar, LogOut, Twitter, Shield, Menu, X } from "lucide-react";
import { Logo } from "@/components/task/logo";
import { cn } from "@/lib/utils";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo / Title */}
        <Link href="/" className="flex items-center space-x-2">
          <Logo width={120} height={120} className="h-8 w-auto" />
          <span className="font-mono font-bold text-lg md:text-xl">TaskVault AI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/create"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Create Task
          </Link>
          <Link
            href="/tasks"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Browse Tasks
          </Link>

          {/* Auth actions */}
          {ready && !authenticated && (
            <Button variant="outline" onClick={login}>
              Login
            </Button>
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

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Theme Toggle */}
          <ModeToggle />
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-10 w-10 p-0"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Navigation Links */}
            <nav className="flex flex-col space-y-3">
              <Link
                href="/create"
                className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-accent"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Task
              </Link>
              <Link
                href="/tasks"
                className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-accent"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Tasks
              </Link>
              
              {/* Twitter Verification Link */}
              {ready && authenticated && (
                <Link
                  href="/twitter"
                  className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-accent flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Twitter className="h-4 w-4 text-blue-500" />
                  <span>Verify Twitter</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    ZK Proof
                  </Badge>
                </Link>
              )}
            </nav>

            {/* Auth Section */}
            <div className="border-t pt-4">
              {ready && !authenticated && (
                <Button
                  variant="outline"
                  onClick={login}
                  className="w-full"
                >
                  Login
                </Button>
              )}

              {ready && authenticated && (
                <div className="space-y-3">
                  {/* Profile Info */}
                  {profile && (
                    <div className="flex items-center gap-3 p-3 rounded-md bg-accent/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {profile.address?.slice(0, 6)}...{profile.address?.slice(-4)}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
