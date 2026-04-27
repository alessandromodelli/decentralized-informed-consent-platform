"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { CONSENT_CONTRACT_ADDRESS, CONSENT_CONTRACT_ABI } from "@/lib/contract";

export function useRevokeConsent() {
  const revokeContractMutation = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: revokeContractMutation.data,
  });

  const revokeConsent = async (consentHash: `0x${string}`) => {
    await revokeContractMutation.mutateAsync({
      address: CONSENT_CONTRACT_ADDRESS,
      abi: CONSENT_CONTRACT_ABI,
      functionName: "revokeConsent",
      args: [consentHash],
      // chainId: hardhat.id,
      chainId: polygonAmoy.id,
      // gas: BigInt(100_000),
    });
  };

  return {
    revokeConsent,
    hash: revokeContractMutation.data,
    isPending: revokeContractMutation.isPending,
    isConfirming,
    isSuccess,
    error: revokeContractMutation.error,
    reset: revokeContractMutation.reset,
  };
}