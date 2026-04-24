"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConnection } from "wagmi";
import ConnectWalletButton from "@/components/layout/ConnectWalletButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { useGiveConsent } from "@/hooks/useGiveConsent";
import {
  ArrowLeft,
  FileCheck,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
} from "lucide-react";
import ConnectWalletCard from "@/components/layout/ConnectWalletCard";

type ConsentState =
  | "idle"
  | "hashing"
  | "uploading"
  | "signing"
  | "confirming"
  | "done"
  | "error";

export default function GiveConsentPage() {
  const router = useRouter();
  const { isConnected } = useConnection();
  const { submitConsent, isPending, isConfirming, isSuccess, error, reset } =
    useGiveConsent();

  const [file, setFile] = useState<File | null>(null);
  const [consentState, setConsentState] = useState<ConsentState>("idle");
  const [result, setResult] = useState<{
    txHash: string;
    cid: string;
    documentHash: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string>("");

  // // redirect automatico dopo successo
  // useEffect(() => {
  //   if (isSuccess && consentState === "done") {
  //     const timer = setTimeout(() => router.push("/dashboard"), 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isSuccess, consentState, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFileError("");
    reset();

    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setFileError("Solo file PDF sono accettati");
      return;
    }
    if (selected.size > 10_000_000) {
      setFileError("Il file non può superare 10MB");
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setFileError("Seleziona un file PDF");
      return;
    }

    try {
      setConsentState("idle");
      const res = await submitConsent(file, setConsentState);
      if (res) {
        setResult(res);
        setConsentState("done");
      }
    } catch (err) {
      console.error("Errore durante il consenso:", err);
      setConsentState("error");
    }
  };

  // stato label durante il flusso
  const stateLabel: Record<ConsentState, string> = {
    idle: "Fornisci Consenso",
    uploading: "Caricamento su IPFS...",
    hashing: "Calcolo hash...",
    signing: "Conferma nel wallet...",
    confirming: "Attendi conferma blockchain...",
    done: "Completato",
    error: "Riprova",
  };

  // Not connected state
  if (!isConnected) {
    return <ConnectWalletCard />;
  }

  // Success
  if (consentState === "done" && result) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Empty className="max-w-md border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </EmptyMedia>
            <EmptyTitle>Consenso Registrato</EmptyTitle>
            <EmptyDescription>
              Il tuo consenso è stato registrato con successo sulla blockchain.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="w-full rounded-lg bg-muted/50 p-3 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Transaction Hash
                </p>
                <p className="break-all font-mono text-sm">{result.txHash}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">IPFS CID</p>
                <p className="break-all font-mono text-sm">{result.cid}</p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Button variant="outline" className="gap-2" asChild>
                <a
                  href={`https://amoy.polygonscan.com/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Vedi su PolygonScan Amoy
                </a>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Torna alla Dashboard</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Reindirizzamento automatico in 3 secondi...
            </p>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  // Form

  const isBusy = consentState !== "idle" && consentState !== "error";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm
                     text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla Dashboard
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">Fornisci Consenso</h1>
        <p className="mt-2 text-muted-foreground">
          Carica il documento PDF del consenso informato per registrarlo sulla
          blockchain.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center
                            rounded-lg bg-primary/10"
            >
              <FileCheck className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Nuovo Consenso</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload PDF */}
            <div className="space-y-2">
              <label
                htmlFor="pdf-upload"
                className="text-sm font-medium leading-none"
              >
                Documento PDF *
              </label>
              <div
                className={`
                  flex flex-col items-center justify-center gap-3
                  rounded-lg border-2 border-dashed p-8 transition-colors
                  ${
                    file
                      ? "border-primary/50 bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }
                  ${fileError ? "border-destructive" : ""}
                `}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Trascina un PDF qui oppure clicca per selezionarlo
                  </p>
                )}
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isBusy}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                  disabled={isBusy}
                >
                  {file ? "Cambia file" : "Seleziona PDF"}
                </Button>
              </div>
              {fileError && (
                <p className="text-sm text-destructive">{fileError}</p>
              )}
              {!fileError && (
                <p className="text-xs text-muted-foreground">
                  Solo PDF, max 10MB. Il documento viene caricato su IPFS e il
                  suo hash registrato on-chain.
                </p>
              )}
            </div>

            {/* Stato corrente durante il flusso */}
            {consentState !== "idle" && consentState !== "error" && (
              <div
                className="flex items-center gap-3 rounded-lg
                              bg-muted/50 px-4 py-3 text-sm"
              >
                <Spinner className="h-4 w-4 shrink-0" />
                <span>{stateLabel[consentState]}</span>
              </div>
            )}

            {/* Errore */}
            {(error || consentState === "error") && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Errore</AlertTitle>
                <AlertDescription>
                  {error?.message || "Si è verificato un errore. Riprova."}
                </AlertDescription>
              </Alert>
            )}

            {/* Info */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <Shield className="h-4 w-4 text-primary" />
                Informazioni Importanti
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  - Il consenso sarà registrato immutabilmente sulla blockchain
                </li>
                <li>- Potrai revocare il consenso in qualsiasi momento</li>
                <li>- La transazione richiederà una piccola fee in MATIC</li>
              </ul>
            </div>

            {/* Azioni */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={isBusy}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isBusy || !file}
              >
                {isBusy ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    {stateLabel[consentState]}
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" />
                    {stateLabel[consentState]}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
