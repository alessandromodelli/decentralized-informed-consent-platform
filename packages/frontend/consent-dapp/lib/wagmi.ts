// Configurazione wagmi con RPC pubblico gratuito
import { createConfig, fallback, http } from "wagmi";
import { hardhat, localhost, mainnet, polygonAmoy } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";
import { injected } from "wagmi/connectors";

export const config = createConfig(
  getDefaultConfig({
    chains: [polygonAmoy, mainnet],
    // chains: [hardhat, mainnet],
    connectors: [injected()], // Nessun connettore, solo MetaMask
    transports: {
      // [hardhat.id]: http("http://127.0.0.1:8545"),
      [mainnet.id]: http("https://cloudflare-eth.com"),
      [polygonAmoy.id]: fallback([
        // RPC pubblico Polygon 
        http("https://rpc-amoy.polygon.technology"),
        // Alchemy come fallback per le transazioni
        http(
          process.env.NEXT_PUBLIC_RPC_URL ??
            "https://rpc-amoy.polygon.technology",
        ),
      ]),
      //[localhost.id]: http('http://127.0.0.1:8545'),
    },
    walletConnectProjectId: "", // non necessario per MetaMask-only
    appName: "Consent DApp",
  }),
);
