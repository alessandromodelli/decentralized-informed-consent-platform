// Configurazione wagmi con RPC pubblico gratuito
import { createConfig, http } from "wagmi";
import { hardhat, localhost, mainnet, polygonAmoy } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";
import { injected } from "wagmi/connectors";

export const config = createConfig(
  getDefaultConfig({
    // chains: [polygonAmoy],
    chains: [hardhat, mainnet],
    connectors: [injected()], // Nessun connettore, solo MetaMask
    transports: {
      // RPC pubblico Polygon
      //[polygonAmoy.id]: http("https://rpc-amoy.polygon.technology"),
      //Alchemy
      [hardhat.id]: http("http://127.0.0.1:8545"),
      [mainnet.id]: http("https://cloudflare-eth.com"),
      //[polygonAmoy.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
      //[localhost.id]: http('http://127.0.0.1:8545'),
    },
    walletConnectProjectId: "", // non necessario per MetaMask-only
    appName: "Consent DApp",
  }),
);

