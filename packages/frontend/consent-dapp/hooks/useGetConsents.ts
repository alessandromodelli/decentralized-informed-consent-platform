"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { useConnection } from "wagmi";
import { type Address } from "viem";
import { hardhat } from "wagmi/chains";
import {
  CONSENT_CONTRACT_ADDRESS,
  CONSENT_CONTRACT_ABI,
} from "@/lib/contract";

export type ConsentRecord = {
  documentHash: `0x${string}`;
  isValid: boolean;
  timestamp: bigint;
  version: number;
};

export function useGetConsents(patientAddress?: Address) {
  const { address: connectedAddress } = useConnection();
  const addressToQuery = patientAddress || connectedAddress;

  // Step 1: recupera tutti gli hash del paziente
  const {
    data: hashes,
    isLoading: isLoadingHashes,
    error: hashesError,
    refetch,
  } = useReadContract({
    address: CONSENT_CONTRACT_ADDRESS,
    abi: CONSENT_CONTRACT_ABI,
    functionName: "getPatientConsents",
    args: addressToQuery ? [addressToQuery] : undefined,
    chainId: hardhat.id,
    query: {
      enabled: !!addressToQuery,
      staleTime: 5000,
    },
  });

  // Step 2: per ogni hash chiama isConsentValid
  const hashArray = (hashes as `0x${string}`[] | undefined) ?? [];

  const { data: validityData, isLoading: isLoadingValidity } = useReadContracts({
    contracts: hashArray.map((hash) => ({
      address: CONSENT_CONTRACT_ADDRESS,
      abi: CONSENT_CONTRACT_ABI,
      functionName: "isConsentValid",
      args: [addressToQuery!, hash],
      chainId: hardhat.id,
    })),
    query: {
      enabled: hashArray.length > 0 && !!addressToQuery,
      staleTime: 5000,
    },
  });

  // Step 3: combina hash + validity in oggetti ConsentRecord
  const consents: ConsentRecord[] = hashArray
    .map((hash, i) => {
      const result = validityData?.[i];
      if (!result || result.status !== "success") return null;

      const [isValid, timestamp, version] = result.result as unknown as [
        boolean,
        bigint,
        number,
      ];

      return {
        documentHash: hash,
        isValid,
        timestamp,
        version,
      };
    })
    .filter((c): c is ConsentRecord => c !== null);

  // Separa attivi da revocati
  const activeConsents  = consents.filter((c) => c.isValid);
  const revokedConsents = consents.filter((c) => !c.isValid);

  return {
    consents,          // tutti (attivi + revocati)
    activeConsents,    // solo attivi
    revokedConsents,   // solo revocati
    isLoading: isLoadingHashes || isLoadingValidity,
    error: hashesError,
    refetch,
  };
}