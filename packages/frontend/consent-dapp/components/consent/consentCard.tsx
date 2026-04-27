"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileCheck,
  FileX,
  Clock,
  Hash,
  Check,
  Copy,
} from "lucide-react";
import { type ConsentRecord } from "@/hooks/useGetConsents";
import { useState } from "react";

interface ConsentCardProps {
  consent: ConsentRecord;
  onRevoke?: (consentHash: `0x${string}`) => void;
  showRevokeButton?: boolean;
}

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

export function ConsentCard({
  consent,
  onRevoke,
  showRevokeButton = false,
}: ConsentCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(consent.documentHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Card
      className={`transition-all ${
        consent.isValid
          ? "border-border hover:border-primary/30 hover:shadow-md"
          : "border-border/50 bg-muted/30"
      }`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              consent.isValid ? "bg-primary/10" : "bg-muted"
            }`}
          >
            {consent.isValid ? (
              <FileCheck className="h-5 w-5 text-primary" />
            ) : (
              <FileX className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-foreground">
              {consent.documentHash.slice(0, 10)}…
              {consent.documentHash.slice(-6)}
            </h3>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(consent.timestamp)}
            </p>
          </div>
        </div>
        <Badge
          variant={consent.isValid ? "default" : "secondary"}
          className={
            consent.isValid
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-destructive/10 text-destructive"
          }
        >
          {consent.isValid ? "Attivo" : "Revocato"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Hash className="h-4 w-4" />
              Document Hash
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">
                {consent.documentHash.slice(0, 10)}…
                {consent.documentHash.slice(-6)}
              </span>
              <button
                onClick={handleCopy}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Copia hash completo"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              Data
            </span>
            <span className="text-foreground">
              {formatDate(consent.timestamp)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-muted-foreground">Versione</span>
            <span className="text-foreground">v{consent.version}</span>
          </div>
        </div>

        {showRevokeButton && consent.isValid && onRevoke && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRevoke(consent.documentHash)}
            >
              Revoca
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
