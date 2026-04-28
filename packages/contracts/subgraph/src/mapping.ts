import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import {
  ConsentGiven as ConsentGivenEvent,
  ConsentRevoked as ConsentRevokedEvent,
} from "../generated/ConsentManager/ConsentManager";
import {
  Consent,
  ConsentGivenEvent as ConsentGivenEntity,
  ConsentRevokedEvent as ConsentRevokedEntity,
} from "../generated/schema";

export function handleConsentGiven(event: ConsentGivenEvent): void {
  // Salva evento grezzo
  const ev = new ConsentGivenEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  ev.patient      = event.params.patient;
  ev.documentHash = event.params.documentHash;
  ev.ipfsCid      = event.params.ipfsCid;
  ev.timestamp    = event.params.timestamp;
  ev.version      = event.params.version;
  ev.blockNumber  = event.block.number;
  ev.txHash       = event.transaction.hash;
  ev.save();

  // Aggiorna stato corrente del consenso
  const id = event.params.patient.concat(event.params.documentHash);
  let consent = Consent.load(id);
  if (!consent) consent = new Consent(id);

  consent.patient      = event.params.patient;
  consent.documentHash = event.params.documentHash;
  consent.ipfsCid      = event.params.ipfsCid;
  consent.isValid      = true;
  consent.timestamp    = event.params.timestamp;
  consent.version      = event.params.version;
  consent.revokedAt    = null;
  consent.save();
}

export function handleConsentRevoked(event: ConsentRevokedEvent): void {
  // Salva evento grezzo
  const ev = new ConsentRevokedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  ev.patient      = event.params.patient;
  ev.documentHash = event.params.documentHash;
  ev.timestamp    = event.params.timestamp;
  ev.blockNumber  = event.block.number;
  ev.txHash       = event.transaction.hash;
  ev.save();

  // Aggiorna stato
  const id = event.params.patient.concat(event.params.documentHash);
  const consent = Consent.load(id);
  if (!consent) return;
  consent.isValid   = false;
  consent.revokedAt = event.params.timestamp;
  consent.save();
}