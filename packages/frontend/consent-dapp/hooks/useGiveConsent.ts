"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, toBytes } from "viem";
import { hardhat } from "wagmi/chains";
import { CONSENT_CONTRACT_ADDRESS, CONSENT_CONTRACT_ABI } from "@/lib/contract";

type ConsentState =
  | "idle" | "hashing" | "uploading" | "signing" | "confirming" | "done" | "error";

export function useGiveConsent() {
  const writeContract = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeContract.data,
  });

  async function submitConsent(
    file: File,
    onStateChange: (s: ConsentState) => void
  ) {
    try {
      // Upload IPFS
      onStateChange("uploading");
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload-consent", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload IPFS fallito");
      const { cid } = await res.json() as { cid: string };

      // Calcola documentHash dal CID
      onStateChange("hashing");
      const documentHash = keccak256(toBytes(cid)) as `0x${string}`;

      // Invia transazione (MetaMask)
      onStateChange("signing");
      const txHash = await writeContract.mutateAsync({
        address: CONSENT_CONTRACT_ADDRESS,
        abi: CONSENT_CONTRACT_ABI,
        functionName: "giveConsent",
        args: [documentHash, cid],
        chainId: hardhat.id,
        gas: BigInt(500_000),
      });

      onStateChange("confirming");
      return { txHash, cid, documentHash };

    } catch (err) {
      onStateChange("error");
      throw err;
    }
  }

  return {
    submitConsent,
    isPending: writeContract.isPending,
    isConfirming,
    isSuccess,
    error: writeContract.error,
    reset: writeContract.reset,
  };
}