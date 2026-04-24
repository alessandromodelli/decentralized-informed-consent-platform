"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useConnection } from "wagmi";
import ConnectWalletButton from "@/components/layout/ConnectWalletButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ConsentCard } from "@/components/consent/consentCard";
import { ConsentRecord, useGetConsents } from "@/hooks/useGetConsents";
import { useRevokeConsent } from "@/hooks/useRevokeConsent";
import { CONSENT_TYPES } from "@/lib/contract";
import {
  ArrowLeft,
  FileX,
  Shield,
  Search,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import ConnectWalletCard from "@/components/layout/ConnectWalletCard";

export default function RevokeConsentPage() {
  const { isConnected } = useConnection();
  const { isLoading, refetch, activeConsents } = useGetConsents();
  const {
    revokeConsent,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  } = useRevokeConsent();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter based on search
  const filteredConsents = activeConsents.filter((consent) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      consent.documentHash.toLowerCase().includes(searchLower.toLowerCase()) ||
      consent.timestamp.toString().includes(searchTerm) ||
      consent.version.toString().includes(searchTerm)
    );
  });

  // Handle successful revocation
  useEffect(() => {
    if (isSuccess) {
      setDialogOpen(false);
      setSelectedConsent(null);
      refetch();
    }
  }, [isSuccess, refetch]);

  const handleRevokeClick = (consent: ConsentRecord) => {
    setSelectedConsent(consent);
    setDialogOpen(true);
    reset();
  };

  const handleConfirmRevoke = async () => {
    if (!selectedConsent) return;
    await revokeConsent(selectedConsent.documentHash);
  };

  // Not connected state
  if (!isConnected) {
    return <ConnectWalletCard />;
  }

  // Success after revocation
  if (isSuccess && hash) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Empty className="max-w-md border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
            </EmptyMedia>
            <EmptyTitle>Consenso Revocato</EmptyTitle>
            <EmptyDescription>
              Il consenso è stato revocato con successo. La revoca è stata
              registrata sulla blockchain.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="w-full rounded-lg bg-muted/50 p-3">
              <p className="mb-1 text-xs text-muted-foreground">
                Transaction Hash
              </p>
              <p className="break-all font-mono text-sm text-foreground">
                {hash}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Button variant="outline" className="gap-2" asChild>
                <a
                  href={`https://polygonscan.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Vedi su Polygonscan
                </a>
              </Button>
              <Button onClick={() => reset()}>Revoca un altro consenso</Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Torna alla Dashboard</Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Revoca Consenso
        </h1>
        <p className="mt-2 text-muted-foreground">
          Seleziona un consenso attivo da revocare. La revoca sarà registrata
          immutabilmente sulla blockchain.
        </p>
      </div>

      {/* Warning Box */}
      <Alert className="mb-6 border-warning/50 bg-warning/10">
        <AlertTriangle className="h-4 w-4 text-warning-foreground" />
        <AlertTitle className="text-warning-foreground">Attenzione</AlertTitle>
        <AlertDescription>
          La revoca di un consenso è un&apos;azione irreversibile registrata
          sulla blockchain. Una volta revocato, il provider sanitario non avrà
          più accesso ai dati associati a questo consenso.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <div className="mb-6">
        <InputGroup>
          <InputGroupAddon>
            <Search className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Cerca per tipo, provider o ID..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Consents List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : filteredConsents.length === 0 ? (
        <Empty className="border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileX className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>
              {searchTerm
                ? "Nessun consenso trovato"
                : "Nessun consenso attivo"}
            </EmptyTitle>
            <EmptyDescription>
              {searchTerm
                ? "Prova a modificare i criteri di ricerca"
                : "Non hai consensi attivi da revocare"}
            </EmptyDescription>
          </EmptyHeader>
          {!searchTerm && (
            <EmptyContent>
              <Button asChild>
                <Link href="/dashboard">Torna alla Dashboard</Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredConsents.map((consent) => (
            <ConsentCard
              key={consent.documentHash.toString()}
              consent={consent}
              showRevokeButton
              onRevoke={() => handleRevokeClick(consent)}
            />
          ))}
        </div>
      )}

      {/* Revoke Confirmation AlertDialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Conferma Revoca
            </AlertDialogTitle>
            <AlertDialogDescription>
              Stai per revocare il seguente consenso. Questa azione è
              irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* {selectedConsent && (
            <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID Consenso:</span>
                <span className="font-mono font-medium text-foreground">
                  #{selectedConsent.documentHash.toString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium text-foreground">
                  {getConsentTypeLabel(selectedConsent.consentType)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-mono text-foreground">
                  {selectedConsent.provider.slice(0, 10)}...
                </span>
              </div>
            </div>
          )} */}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>
                {error.message || "Si è verificato un errore. Riprova."}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending || isConfirming}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={isPending || isConfirming}
              className="gap-2"
            >
              {isPending || isConfirming ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {isPending ? "Conferma..." : "Elaborazione..."}
                </>
              ) : (
                <>
                  <FileX className="h-4 w-4" />
                  Revoca Consenso
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
