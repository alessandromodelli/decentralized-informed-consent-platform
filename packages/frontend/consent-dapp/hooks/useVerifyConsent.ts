"use client";

import { useReadContract } from "wagmi";
import { createPublicClient, http, type Address } from "viem";
import { polygonAmoy } from "wagmi/chains";
import { CONSENT_CONTRACT_ADDRESS, CONSENT_CONTRACT_ABI } from "@/lib/contract";

export type ConsentVerification = {
  documentHash: `0x${string}`;
  isValid: boolean;
  timestamp: bigint;
  version: number;
};

const SUBGRAPH_URL =
  "https://api.studio.thegraph.com/query/1749012/consent-chain/v0.0.1";

export function useVerifyConsent(
  patientAddress?: Address,
  documentHash?: `0x${string}`,
) {
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http("/api/rpc-logs"),
  });

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONSENT_CONTRACT_ADDRESS,
    abi: CONSENT_CONTRACT_ABI,
    functionName: "isConsentValid",
    args:
      patientAddress && documentHash
        ? [patientAddress, documentHash]
        : undefined,
    // chainId: hardhat.id,
    chainId: polygonAmoy.id,
    query: {
      enabled: !!patientAddress && !!documentHash,
      staleTime: 5000,
    },
  });

  async function fetchCidFromEvents(
    patient: Address,
    docHash: `0x${string}`,
  ): Promise<string | null> {
    try {
      const query = `{
        consents(
          where: {
            patient: "${patient.toLowerCase()}"
            documentHash: "${docHash.toLowerCase()}"
          }
        ) {
          ipfsCid
          isValid
          version
        }
      }`;

      const res = await fetch(SUBGRAPH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const { data } = (await res.json()) as {
        data: {
          consents: {
            ipfsCid: string;
            isValid: boolean;
            version: number;
          }[];
        };
      };

      if (!data?.consents?.length) return null;
      return data.consents[0].ipfsCid;
    } catch (e) {
      console.error("Subgraph query error:", e);
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
    fetchCidFromEvents,
  };
}
