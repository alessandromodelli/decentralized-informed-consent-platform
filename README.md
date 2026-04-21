# Decentralized-informed-consent-platform
Decentralized informed consent management for healthcare. Solidity smart contract on Polygon Amoy, Next.js frontend, IPFS document storage.

# Test smart-contract ConsentManager.sol

´´´
## Test locale (istantaneo, gratis)
npx hardhat ignition deploy ignition/modules/ConsentManager.ts

## Su Polygon Amoy (gratis con MATIC da faucet)
npx hardhat ignition deploy ignition/modules/ConsentManager.ts --network amoy

## Deploy + verifica automatica su PolygonScan in un solo comando
npx hardhat ignition deploy ignition/modules/ConsentManager.ts --network amoy --verify
´´´

Dopo il deploy del contratto in locale è necessario prendere il codice del contratto e salvarlo nel .env.local del frontend

