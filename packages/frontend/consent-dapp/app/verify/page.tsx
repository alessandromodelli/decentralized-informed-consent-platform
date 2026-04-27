"use client";

import { useEffect, useState } from "react";
import { useConnection } from "wagmi";
import { isAddress, type Address } from "viem";
import ConnectWalletButton from "@/components/layout/ConnectWalletButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useVerifyConsent } from "@/hooks/useVerifyConsent";
import {
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Clock,
  Hash,
  ExternalLink,
} from "lucide-react";

function formatRelativeTime(timestamp: bigint): string {
  const now = Date.now();
  const date = Number(timestamp) * 1000;
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "pochi secondi fa";
  if (minutes < 60) return `${minutes} minut${minutes === 1 ? "o" : "i"} fa`;
  if (hours < 24) return `${hours} or${hours === 1 ? "a" : "e"} fa`;
  if (days < 30) return `${days} giorn${days === 1 ? "o" : "i"} fa`;
  if (months < 12) return `${months} mes${months === 1 ? "e" : "i"} fa`;
  return `${years} ann${years === 1 ? "o" : "i"} fa`;
}

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function VerifyPage() {
  const { address, isConnected } = useConnection();
  const [patientAddress, setPatientAddress] = useState("");
  const [documentHashInput, setDocumentHashInput] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [patientError, setPatientError] = useState("");
  const [hashError, setHashError] = useState("");
  const [cid, setCid] = useState<string | null>(null);
  const [cidLoading, setCidLoading] = useState(false);
  // const [fileVerifyResult, setFileVerifyResult] = useState<
  //   "idle" | "match" | "mismatch"
  // >("idle");
  // const [fileVerifyLoading, setFileVerifyLoading] = useState(false);

  const validPatient =
    hasSearched && isAddress(patientAddress)
      ? (patientAddress as Address)
      : undefined;

  const validHash =
    hasSearched && documentHashInput.startsWith("0x")
      ? (documentHashInput as `0x${string}`)
      : undefined;

  const {
    isValid,
    timestamp,
    version,
    documentHash,
    isLoading,
    error,
    refetch,
    fetchCidFromEvents,
  } = useVerifyConsent(validPatient, validHash);

  const handleSearch = () => {
    setPatientError("");
    setHashError("");
    let valid = true;

    if (!patientAddress) {
      setPatientError("Inserisci l'indirizzo del paziente");
      valid = false;
    } else if (!isAddress(patientAddress)) {
      setPatientError("Inserisci un indirizzo Ethereum valido");
      valid = false;
    }

    if (!documentHashInput) {
      setHashError("Inserisci il document hash");
      valid = false;
    } else if (
      !documentHashInput.startsWith("0x") ||
      documentHashInput.length !== 66
    ) {
      setHashError(
        "Hash non valido — deve essere 0x seguito da 64 caratteri hex",
      );
      valid = false;
    }

    if (!valid) return;
    setHasSearched(true);
    refetch();
  };

  // Verifica crittografica locale: il provider trascina il file
  // async function handleFileVerify(e: React.ChangeEvent<HTMLInputElement>) {
  //   setFileVerifyLoading(true);
  //   const file = e.target.files?.[0];
  //   if (!file || !cid || !documentHash) return;

  //   // Ricalcola l'hash dal CID del file caricato
  //   // Prima devi caricare il file su IPFS per ottenere il suo CID,
  //   // oppure confrontare il documentHash direttamente con il file locale
  //   // tramite una chiamata alla API route

  //   const form = new FormData();
  //   form.append("file", file);
  //   const res = await fetch("/api/compute-hash", {
  //     method: "POST",
  //     body: form,
  //   });
  //   const { hash } = (await res.json()) as { hash: string };

  //   setFileVerifyResult(
  //     hash.toLowerCase() === documentHash.toLowerCase() ? "match" : "mismatch",
  //   );
  //   setFileVerifyLoading(false);
  // }

  useEffect(() => {
    if (isValid && validPatient && validHash) {
      setCidLoading(true);
      fetchCidFromEvents(validPatient, validHash).then((c) => {
        setCid(c);
        setCidLoading(false);
      });

    }
  }, [isValid, validPatient, validHash]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Search className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">Verifica Consenso</h1>
        <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
          I provider sanitari possono verificare se un paziente ha fornito un
          consenso valido per i propri trattamenti.
        </p>
      </div>

      {/* Wallet alert */}
      {!isConnected && (
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertTitle>Connetti il Wallet del Provider</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>
              Per verificare un consenso, connetti il wallet del provider.
            </span>
            <ConnectWalletButton />
          </AlertDescription>
        </Alert>
      )}

      {/* Search card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Cerca Consenso
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field data-invalid={!!patientError}>
            <FieldLabel htmlFor="patientAddress">
              Indirizzo Wallet Paziente
            </FieldLabel>
            <Input
              id="patientAddress"
              placeholder="0x..."
              value={patientAddress}
              onChange={(e) => {
                setPatientAddress(e.target.value);
                setPatientError("");
                setHasSearched(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              aria-invalid={!!patientError}
            />
            {patientError && <FieldError>{patientError}</FieldError>}
          </Field>

          <Field data-invalid={!!hashError}>
            <FieldLabel htmlFor="documentHash">Document Hash</FieldLabel>
            <Input
              id="documentHash"
              placeholder="0x..."
              value={documentHashInput}
              onChange={(e) => {
                setDocumentHashInput(e.target.value);
                setHashError("");
                setHasSearched(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              aria-invalid={!!hashError}
            />
            {hashError && <FieldError>{hashError}</FieldError>}
          </Field>

          <Button
            onClick={handleSearch}
            disabled={!isConnected || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Verifica
          </Button>

          {isConnected && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Stai verificando come:
              </p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risultati */}
      {hasSearched && !isLoading && (
        <>
          {error ? (
            <Card className="border-destructive/50">
              <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">Errore nella Verifica</p>
                  <p className="text-sm text-muted-foreground">
                    {error.message ||
                      "Impossibile verificare il consenso. Riprova."}
                  </p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                  Riprova
                </Button>
              </CardContent>
            </Card>
          ) : isValid ? (
            <Card className="border-emerald-500/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    Consenso Valido
                  </CardTitle>
                  <Badge className="bg-emerald-500/10 text-emerald-600">
                    Attivo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Il paziente ha fornito un consenso valido e attivo.
                </p>
                <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      Document Hash
                    </span>
                    <span className="font-mono text-xs">
                      {documentHash
                        ? `${documentHash.slice(0, 10)}…${documentHash.slice(-6)}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Data Consenso
                    </span>
                    <span className="text-sm">
                      {timestamp > 0
                        ? `${formatDate(timestamp)} · ${formatRelativeTime(timestamp)}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Versione
                    </span>
                    <span className="text-sm">v{version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Paziente
                    </span>
                    <span className="font-mono text-sm">
                      {truncateAddress(patientAddress)}
                    </span>
                  </div>
                </div>

                {/* Sezione verifica documento — visibile solo se consenso valido */}
                {isValid && (
                  <div className="space-y-4 mt-4">
                    {/* Link al documento su IPFS */}
                    {cidLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner className="h-4 w-4" /> Recupero CID dall'evento
                        on-chain...
                      </div>
                    )}

                    {cid && (
                      <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">IPFS CID</span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-sm text-muted-foreground ">
                              <Hash className="h-4 w-4" />
                              Document Hash
                            </span>
                            <span className="font-mono text-xs break-all">
                              {cid as `0x${string}`}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 w-full"
                          asChild
                        >
                          <a
                            href={`${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${cid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Apri documento su IPFS
                          </a>
                        </Button>
                      </div>
                    )}

                    {/* Verifica crittografica locale
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Verifica crittografica documento
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Carica il documento fisico per verificare che
                        corrisponda esattamente a quello registrato on-chain.
                      </p>
                      <input
                        type="file"
                        accept="application/pdf"
                        id="verify-file"
                        className="hidden"
                        onChange={handleFileVerify}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full"
                        onClick={() =>
                          document.getElementById("verify-file")?.click()
                        }
                      >
                        <Upload className="h-4 w-4" />
                        Carica PDF per verifica
                      </Button>
                      {fileVerifyLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Spinner className="h-4 w-4" />
                          Verifica in corso...
                        </div>
                      )}
                      {fileVerifyResult === "match" && (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Documento autentico — hash corrisponde al valore
                          on-chain
                        </div>
                      )}
                      {fileVerifyResult === "mismatch" && (
                        <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                          <XCircle className="h-4 w-4" />
                          Documento non autentico — hash non corrisponde
                        </div>
                      )}
                    </div> */}
                  </div>
                )}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-medium">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    Verifica On-Chain
                  </h4>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Questo consenso è registrato immutabilmente sulla
                    blockchain.
                  </p>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a
                      href={`https://amoy.polygonscan.com/address/${patientAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Vedi su PolygonScan Amoy
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-destructive/30">
              <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-medium">Nessun Consenso Trovato</h3>
                  <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                    Il paziente non ha fornito un consenso attivo, oppure è
                    stato revocato.
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-left w-full">
                  <p className="text-xs text-muted-foreground">Paziente</p>
                  <p className="font-mono text-sm">
                    {truncateAddress(patientAddress)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Info */}
      <div className="mt-8 rounded-lg border bg-card p-6">
        <h3 className="mb-4 font-semibold">Come Funziona la Verifica</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Inserisci i Dati",
              desc: "Indirizzo paziente e document hash",
            },
            {
              step: "2",
              title: "Verifica On-Chain",
              desc: "Lo smart contract verifica il consenso",
            },
            {
              step: "3",
              title: "Risultato Istantaneo",
              desc: "Visualizza lo stato del consenso",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {step}
              </div>
              <h4 className="mb-1 font-medium">{title}</h4>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
