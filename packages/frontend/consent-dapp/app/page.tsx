"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Lock,
  FileCheck,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Immutabile",
    description:
      "Ogni consenso è registrato su blockchain, garantendo integrità e tracciabilità permanente.",
  },
  {
    icon: Shield,
    title: "Sicuro",
    description:
      "Crittografia avanzata e autenticazione tramite wallet per massima protezione dei dati.",
  },
  {
    icon: FileCheck,
    title: "Verificabile",
    description:
      "Provider sanitari possono verificare istantaneamente la validità dei consensi.",
  },
  {
    icon: Users,
    title: "Paziente-Centrico",
    description:
      "Il paziente mantiene il pieno controllo sui propri consensi con revoca immediata.",
  },
];

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
  const { isConnected } = useAccount();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
            <Shield className="h-4 w-4" />
            <span>Powered by Polygon Blockchain</span>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Consenso Informato{" "}
            <span className="text-primary">Decentralizzato</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Gestisci i tuoi consensi sanitari in modo sicuro, trasparente e
            verificabile. La blockchain garantisce immutabilità e pieno
            controllo per i pazienti.
          </p>
          {/* <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isConnected ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Vai alla Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button size="lg" className="gap-2" onClick={openConnectModal}>
                    Inizia Ora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </ConnectButton.Custom>
            )}
            <Link href="/verify">
              <Button variant="outline" size="lg">
                Verifica un Consenso
              </Button>
            </Link>
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Perché ConsentoChain?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Una soluzione innovativa per la gestione del consenso informato
              che mette il paziente al centro.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="border-border/50 bg-background transition-shadow hover:shadow-md"
                >
                  <CardContent className="pt-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
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

      {/* CTA Section */}
      <section className="border-t border-border bg-primary/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Pronto a Iniziare?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Connetti il tuo wallet e inizia a gestire i tuoi consensi in modo
            sicuro e decentralizzato.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <span>Nessuna registrazione richiesta</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <span>Compatibile con MetaMask e WalletConnect</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-secondary" />
              <span>Rete Polygon per transazioni economiche</span>
            </div>
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
