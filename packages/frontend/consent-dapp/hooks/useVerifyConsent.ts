"use client";

import { usePublicClient, useReadContract } from "wagmi";
import { type Address } from "viem";
import { hardhat } from "wagmi/chains";
import { CONSENT_CONTRACT_ADDRESS, CONSENT_CONTRACT_ABI } from "@/lib/contract";

export type ConsentVerification = {
  documentHash: `0x${string}`;
  isValid: boolean;
  timestamp: bigint;
  version: number;
};

export function useVerifyConsent(
  patientAddress?: Address,
  documentHash?: `0x${string}`,
) {

  const publicClient = usePublicClient();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONSENT_CONTRACT_ADDRESS,
    abi: CONSENT_CONTRACT_ABI,
    functionName: "isConsentValid",
    args: patientAddress && documentHash
      ? [patientAddress, documentHash]
      : undefined,
    chainId: hardhat.id,
    query: {
      enabled: !!patientAddress && !!documentHash,
      staleTime: 5000,
    },
  });

    // Recupera il CID dall'evento ConsentGiven
  async function fetchCidFromEvents(
    patient: Address,
    docHash: `0x${string}`
  ): Promise<string | null> {
    if (!publicClient) return null;
    try {
      const logs = await publicClient.getLogs({
        address: CONSENT_CONTRACT_ADDRESS,
        event: {
          type: "event",
          name: "ConsentGiven",
          inputs: [
            { name: "patient",      type: "address", indexed: true  },
            { name: "documentHash", type: "bytes32", indexed: true  },
            { name: "ipfsCid",      type: "string",  indexed: false },
            { name: "timestamp",    type: "uint256", indexed: false },
            { name: "version",      type: "uint8",   indexed: false },
          ],
        },
        args: { patient, documentHash: docHash },
        fromBlock: BigInt(0),
      });

      if (!logs.length) return null;
      // Prendi l'evento con version più alta (re-consenso più recente)
      const latest = logs[logs.length - 1];
      return (latest.args as { ipfsCid: string }).ipfsCid;
    } catch {
      return null;
    }
  }

  const result = data as [boolean, bigint, number] | undefined;

  return {
    isValid: result?.[0] ?? false,
    timestamp: result?.[1] ?? BigInt(0),
    version: result?.[2] ?? 0,
    documentHash,
    isLoading,
    error,
    refetch,
    fetchCidFromEvents
  };
}