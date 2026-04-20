import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import { configVariable, defineConfig } from "hardhat/config";
//import "dotenv/config";

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
      //url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
      url: configVariable("POLYGON_AMOY_RPC"),
      chainId: 80002,
      //accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : ["0x5c0fdqk7hv7khfbn481xxlsujghh42pl3zo0j0o4qbb41dq0uc6wt224ljfge5y0"],
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")] 
    },
  },

  // verify: API key per l'explorer
  verify: {
    etherscan: {
      //apiKey: process.env.POLYGONSCAN_API_KEY || "",
      apiKey: configVariable("POLYGONSCAN_API_KEY")
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