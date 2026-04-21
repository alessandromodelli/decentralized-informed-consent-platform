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

        {/* Wallet Connect + Mobile Menu */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ConnectKitButton />
          </div>
          <div className="sm:hidden">
            <ConnectKitButton />
          </div>

          {/* Mobile Menu */}
          {/* <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Apri menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3",
                          isActive &&
                            "bg-primary/10 text-primary hover:bg-primary/15"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet> */}
        </div>
      </div>
    </header>
  );
}
