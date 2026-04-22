# Decentralized-informed-consent-platform
Decentralized informed consent management for healthcare. Solidity smart contract on Polygon Amoy, Next.js frontend, IPFS document storage.

# Test smart-contract ConsentManager.sol


## Test locale
### Deployment contratto 
All'interno della cartella contracts: 
´´´
npx hardhat ignition deploy ignition/modules/ConsentManager.ts --network localhost
´´´
Copiare il codice identificativo del contratto e inserirlo nel .env del frontend come NEXT_PUBLIC_CONTRACT_ADDRESS

### Avvio nodo locale
´´´
npx hardhat node
´´´
Importare uno degli account finti creati su MetaMask tramite private-key.

### Avvio frontend
´´´
npm run dev
´´´

´´´
## Su Polygon Amoy (gratis con MATIC da faucet)
npx hardhat ignition deploy ignition/modules/ConsentManager.ts --network amoy

## Deploy + verifica automatica su PolygonScan in un solo comando
npx hardhat ignition deploy ignition/modules/ConsentManager.ts --network amoy --verify
´´´

Dopo il deploy del contratto in locale è necessario prendere il codice del contratto e salvarlo nel .env.local del frontend

