"use client";

import { usePublicClient, useReadContract } from "wagmi";
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
  // const DEPLOY_BLOCK = BigInt(37378035); // Sostituisci con il blocco di deploy del contratto
  // // Recupera il CID dall'evento ConsentGiven
  // async function fetchCidFromEvents(
  //   patient: Address,
  //   docHash: `0x${string}`,
  // ): Promise<string | null> {
  //   if (!publicClient) return null;
  //   try {
  //     //A causa del piano gratuito di Alchemy, non possiamo usare il loro RPC per chiamare eth_getLogs su range > 10 blocchi. In questo modo siamo sicuri di trovare l'evento anche se è stato emesso molto tempo fa o se ci sono molti eventi (cosa probabile in un'app reale). Se il contratto è nuovo e non ci sono molti eventi, questa funzione restituirà comunque il risultato al primo tentativo senza ritardi significativi. Per un discorso di scalabilità è necessario utilizzare un piano con un range di blocchi maggiore o una soluzione differente come The Graph
  //     const currentBlock = await publicClient.getBlockNumber();
  //     const CHUNK_SIZE = BigInt(10); // 1000 blocchi per chunk — sotto il limite

  //     let fromBlock = DEPLOY_BLOCK;

  //     while (fromBlock <= currentBlock) {
  //       const toBlock =
  //         fromBlock + CHUNK_SIZE > currentBlock
  //           ? currentBlock
  //           : fromBlock + CHUNK_SIZE;

  //       const logs = await publicClient.getLogs({
  //         address: CONSENT_CONTRACT_ADDRESS,
  //         event: {
  //           type: "event",
  //           name: "ConsentGiven",
  //           inputs: [
  //             { name: "patient", type: "address", indexed: true },
  //             { name: "documentHash", type: "bytes32", indexed: true },
  //             { name: "ipfsCid", type: "string", indexed: false },
  //             { name: "timestamp", type: "uint256", indexed: false },
  //             { name: "version", type: "uint8", indexed: false },
  //           ],
  //         },
  //         args: { patient, documentHash: docHash },
  //         fromBlock,
  //         toBlock,
  //       });

  //       if (logs.length > 0) {
  //         // Trovato — ritorna il CID dell'evento più recente
  //         const latest = logs[logs.length - 1];
  //         return (latest.args as { ipfsCid: string }).ipfsCid;
  //       }

  //       fromBlock = toBlock + BigInt(1); // Avanza al chunk successivo
  //     }

  //     return null;
  //   } catch {
  //     return null;
  //   }
  // }

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
