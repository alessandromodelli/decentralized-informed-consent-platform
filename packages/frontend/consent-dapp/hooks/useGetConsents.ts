"use client";

import { useReadContract, useConnection } from "wagmi";
import { type Address } from "viem";
import {
  CONSENT_CONTRACT_ADDRESS,
  CONSENT_CONTRACT_ABI,
  type Consent,
} from "@/lib/contract";
import { hardhat } from "wagmi/chains";

export function useGetConsents(patientAddress?: Address) {
  const { address: connectedAddress } = useConnection();
  const addressToQuery = patientAddress || connectedAddress;

  const { data, isLoading, error, refetch } = useReadContract({
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

  return {
    consents: (data as Consent[] | undefined) || [],
    isLoading,
    error,
    refetch,
  };
}
