"use client";

import Link from "next/link";
import { useConnection } from "wagmi";
import { ConnectKitButton } from "connectkit";

import { Button } from "@/components/ui/button";
import {
  Shield,
  ArrowRight,
} from "lucide-react";
import ConnectWalletButton from "@/components/layout/ConnectWalletButton";


const steps = [
  {
    number: "01",
    title: "Connetti il Wallet",
    description: "Usa MetaMask o WalletConnect per autenticarti in sicurezza.",
  },
  {
    number: "02",
    title: "Fornisci il Consenso",
    description:
      "Seleziona il tipo di trattamento e il provider sanitario autorizzato.",
  },
  {
    number: "03",
    title: "Registrazione On-Chain",
    description:
      "Il consenso viene registrato immutabilmente sulla blockchain Polygon.",
  },
  {
    number: "04",
    title: "Gestisci e Revoca",
    description:
      "Monitora i tuoi consensi attivi e revocali quando necessario.",
  },
];

export default function HomePage() {
  const { isConnected } = useConnection();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Consenso Informato{" "}
            <span className="text-primary">Decentralizzato</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Gestisci i tuoi consensi sanitari in modo sicuro, trasparente e
            verificabile. La blockchain garantisce immutabilità e pieno
            controllo per i pazienti.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isConnected ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Vai alla Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <ConnectWalletButton label="Inizia ora!"/>
            )}
            <Link href="/verify">
              <Button variant="outline" size="lg">
                Verifica un Consenso
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-card">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Come Funziona</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Un processo semplice e sicuro in quattro passaggi.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/50 to-transparent lg:block" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">ConsentoChain</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} ConsentoChain. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
}
