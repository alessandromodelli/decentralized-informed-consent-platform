// Configurazione wagmi con RPC pubblico gratuito
import { createConfig, http } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";
import { injected } from "wagmi/connectors";

export const config = createConfig(
  getDefaultConfig({
    chains: [polygonAmoy],
    connectors: [injected()], // Nessun connettore, solo MetaMask
    transports: {
      // RPC pubblico Polygon
      //[polygonAmoy.id]: http("https://rpc-amoy.polygon.technology"),
      //Alchemy
      [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
    },
    walletConnectProjectId: "", // non necessario per MetaMask-only
    appName: "Consent DApp",
  })
);