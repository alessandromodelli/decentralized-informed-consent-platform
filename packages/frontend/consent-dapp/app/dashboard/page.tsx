"use client";

import { useState } from "react";
import Link from "next/link";
import { useConnection } from "wagmi";

import ConnectWalletButton from "@/components/layout/ConnectWalletButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
// import { ConsentCard } from "@/components/consent/consent-card";
import { ConsentRecord, useGetConsents } from "@/hooks/useGetConsents";
import {
  FileCheck,
  FileX,
  Plus,
  Search,
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Consent } from "@/lib/contract";

export default function DashboardPage() {
  const { address, isConnected } = useConnection();
  const { consents, isLoading, error, activeConsents, revokedConsents } =
    useGetConsents();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  //   Filter consents based on search and tab
  const filteredConsents = consents.filter((consent: ConsentRecord) => {
    const matchesSearch =
      searchTerm === "" ||
      consent.documentHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.timestamp.toString().includes(searchTerm) ||
      consent.version.toString().includes(searchTerm);

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && consent.isValid) ||
      (activeTab === "revoked" && !consent.isValid);

    return matchesSearch && matchesTab;
  });

  console.log("Consents", consents);
  console.log("Active Consents", activeConsents);
  console.log("Revoked Consents", revokedConsents);

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Connetti il tuo Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Per accedere alla dashboard e gestire i tuoi consensi, connetti il
              tuo wallet.
            </p>
            <ConnectWalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestisci i tuoi consensi informati
          </p>
        </div>
        <Link href="/consent/give">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuovo Consenso
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Totale Consensi</p>
              <p className="text-2xl font-bold text-foreground">
                {consents.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
              <FileCheck className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attivi</p>
              <p className="text-2xl font-bold text-foreground">
                {activeConsents.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <FileX className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revocati</p>
              <p className="text-2xl font-bold text-foreground">
                {revokedConsents.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consents List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>I Tuoi Consensi</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per tipo, provider o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex flex-col"
          >
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="all">Tutti ({consents.length})</TabsTrigger>
              <TabsTrigger value="active">
                Attivi ({activeConsents.length})
              </TabsTrigger>
              <TabsTrigger value="revoked">
                Revocati ({revokedConsents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-8 w-8 text-primary" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Errore nel caricamento
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Impossibile caricare i consensi. Riprova più tardi.
                    </p>
                  </div>
                </div>
              ) : filteredConsents.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <FileCheck className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {searchTerm
                        ? "Nessun risultato"
                        : "Nessun consenso trovato"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm
                        ? "Prova a modificare i criteri di ricerca"
                        : "Inizia creando il tuo primo consenso informato"}
                    </p>
                  </div>
                  {!searchTerm && (
                    <Link href="/consent/give">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Crea Consenso
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredConsents.map(
                    (consent: ConsentRecord, index: number) => (
                      <div
                        key={index}
                        className={`rounded-lg border p-4 transition-colors ${
                          consent.isValid
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : "border-destructive/20 bg-destructive/5"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {consent.isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                consent.isValid
                                  ? "text-emerald-600"
                                  : "text-destructive"
                              }`}
                            >
                              {consent.isValid ? "Attivo" : "Revocato"}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            v{consent.version}
                          </span>
                        </div>
                        <p className="break-all font-mono text-xs text-muted-foreground">
                          {consent.documentHash}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(
                            Number(consent.timestamp) * 1000,
                          ).toLocaleString("it-IT")}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
