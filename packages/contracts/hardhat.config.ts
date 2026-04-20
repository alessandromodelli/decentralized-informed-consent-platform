import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [
    hardhatToolboxViemPlugin,
    hardhatVerify,
  ],

  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },

  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
    amoy: {
      type: "http",
      chainType: "generic",
      url: configVariable("POLYGON_AMOY_RPC"),
      chainId: 80002,
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
  },

  // verify: API key per l'explorer
  verify: {
    etherscan: {
      apiKey: configVariable("POLYGONSCAN_API_KEY"),
    },
  },

  // chainDescriptors: definizione della chain custom (SEPARATO da verify)
  // chiave = chainId numerico
  chainDescriptors: {
    80002: {
      name: "Polygon Amoy",
      blockExplorers: {
        etherscan: {
          name: "PolygonScan Amoy",
          url: "https://amoy.polygonscan.com",
          apiUrl: "https://api-amoy.polygonscan.com/api",
        },
      },
    },
  },
});