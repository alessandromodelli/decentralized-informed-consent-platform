"use client";

import { useReadContract } from "wagmi";
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

  const result = data as [boolean, bigint, number] | undefined;

  return {
    isValid: result?.[0] ?? false,
    timestamp: result?.[1] ?? BigInt(0),
    version: result?.[2] ?? 0,
    documentHash,
    isLoading,
    error,
    refetch,
  };
}