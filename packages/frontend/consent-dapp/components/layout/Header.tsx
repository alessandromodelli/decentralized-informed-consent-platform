"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, Shield, FileCheck, FileX, Search, Sheet } from "lucide-react";
import { useState } from "react";
import MobileMenu from "./mobileMenu";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Shield },
  { name: "Fornisci Consenso", href: "/consent/give", icon: FileCheck },
  { name: "Revoca Consenso", href: "/consent/revoke", icon: FileX },
  { name: "Verifica", href: "/verify", icon: Search },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="col-span-1 lg:hidden">
          <button
            className="flex cursor-pointer active:scale-95 "
            onClick={toggleMobileMenu}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            ConsentoChain
          </span>
        </Link>
        {/* Mobile Menu */}
        <MobileMenu
          isMobileMenuOpen={mobileMenuOpen}
          setIsMobileMenuOpen={setMobileMenuOpen} //Used to close the menu when a link is clicked
          toggleMobileMenu={toggleMobileMenu} // Used to toggle the menu open/close state
          menuItems={navigation}
        />
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive &&
                      "bg-primary/10 text-primary hover:bg-primary/15",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Wallet Connect*/}
        <div className="flex items-center gap-2">
          <ConnectKitButton.Custom>
            {({ isConnected, show, truncatedAddress, ensName }) => {
              return (
                <div
                  onClick={show}
                  className={`
          relative group cursor-pointer select-none
          flex items-center gap-2
          px-4 py-2 rounded-xl
          text-sm 
          transition-all duration-200 ease-out
          ${
            isConnected
              ? "bg-zinc-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/60 hover:bg-zinc-800 shadow-[0_0_12px_rgba(52,211,153,0.1)] hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]"
              : "bg-zinc-700 text-white hover:bg-zinc-900 shadow-sm hover:shadow-md"
          }
        `}
                >
                  {/* Dot di stato */}
                  {isConnected && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
                  )}

                  {/* Label */}
                  <span>
                    {isConnected
                      ? (ensName ??
                        truncatedAddress?.slice(0, 4) +
                          "…" +
                          truncatedAddress?.slice(-2))
                      : "Connect Wallet"}
                  </span>
                </div>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </div>
    </header>
  );
}
