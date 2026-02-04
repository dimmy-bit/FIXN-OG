# FIXN OG - CoFHE Privacy-Preserving NFT Dapp

## Overview
FIXN OG is a privacy-preserving NFT dapp built on Sepolia using Fhenix CoFHE.  
It lets users mint NFTs with encrypted attributes (rarity + special attribute), then decrypt those values on demand.

Key ideas:
- Encrypted traits are stored on-chain as FHE types.
- Only the owner can request decryption.
- PermissionedV2 permits allow sealed access (EIP-712 signatures).

## What We Built
### Smart Contract (Solidity)
Contract: `contracts/contracts/FhenixOGNFT.sol`

Features:
- ERC721 + ERC721URIStorage
- Encrypted rarity and attribute stored as `euint32`
- Encrypted total supply and user mint count
- Encrypted mint timestamp
- Async decrypt with owner-only flow
- PermissionedV2 flow with EIP-712 permit verification
- Mint accepts a direct `tokenURI` (ipfs://...) per NFT

Important functions:
- `mint(InEuint32 rarity, InEuint32 attribute, string tokenUri)`
- `requestDecryptAll(uint256 tokenId)` (owner)
- `requestDecryptAllWithPermission(uint256 tokenId, Permission permission)`
- `getDecryptedRarity(...)` / `getDecryptedAttribute(...)`

Permit system:
- Implemented in `contracts/contracts/PermissionedV2.sol`
- Domain: `name="ACL"`, `version="1"`, `chainId=<network>`, `verifyingContract=<NFT address>`

Latest Sepolia deployment:
- Address: `0x257D5C450268De5f889bb0543f018FCfEE35b209`
- Mint price: `0.001 ETH`

### Frontend (Next.js)
Frontend directory: `frontend/`

Key pages:
- `/` Home
- `/mint` Mint page
- `/my-nfts` My NFTs (owner view + decrypt)

Key components:
- `frontend/src/components/mint/MintCard.tsx` - mint flow
- `frontend/src/components/nft/NFTCard.tsx` - decrypt flow
- `frontend/src/components/nft/NFTGallery.tsx` - gallery + metadata loading

### CoFHE Integration
File: `frontend/src/lib/fhenix.ts`

What we do:
1. Initialize CoFHE using `cofhejs.initializeWithEthers`
2. Encrypt trait values into InEuint32 inputs
3. Build PermissionedV2 EIP-712 permit using the wallet signer
4. Submit decrypt request and poll for decrypt result

Owner decrypt is still proper CoFHE:
- The contract calls `FHE.decrypt(...)` internally
- Values are revealed only after async decrypt completes

## How Minting Works
1. User uploads image + metadata to Pinata
2. Metadata is returned as IPFS CID
3. Frontend builds `tokenURI = ipfs://<CID>`
4. CoFHE encrypts trait values
5. `mint(...)` is called with encrypted values + tokenURI

## How Decryption Works
1. User clicks decrypt
2. Frontend signs an EIP-712 PermissionedV2 permit
3. Contract verifies the permit (or owner flow fallback)
4. Contract calls `FHE.decrypt(...)`
5. Frontend polls until decrypted values are available

## Tech Stack
Smart contracts:
- Solidity 0.8.25
- OpenZeppelin ERC721
- Fhenix CoFHE contracts

Frontend:
- Next.js 16
- Wagmi + RainbowKit
- Ethers.js
- Framer Motion
- Pinata Web3 SDK

## Environment Variables
Create `.env` files where needed:

Contracts (`contracts/.env`):
- `SEPOLIA_RPC_URL=<alchemy or other RPC>`
- `PRIVATE_KEY=<deployer private key>`

Frontend (`frontend/.env.local`):
- `NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed contract address>`
- `NEXT_PUBLIC_PINATA_JWT=<pinata jwt>`
- `NEXT_PUBLIC_PINATA_GATEWAY=<optional>`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<walletconnect project id>`

## Setup Instructions
### 1. Install dependencies
From repo root:
```
cd contracts
npm install

cd ../frontend
npm install
```

### 2. Compile and deploy contract
```
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network eth-sepolia
```

This will:
- Deploy the contract
- Export ABI to `frontend/src/lib/abi/FhenixOGNFT.json`
- Update `frontend/.env.local` with the contract address

### 3. Run frontend
```
cd frontend
npm run dev
```

Open http://localhost:3000

## Notes and Troubleshooting
- Decryption is async. It can take several seconds before results are ready.
- If PermissionedV2 permit fails, owner flow is used (still CoFHE).
- Old NFTs from previous deployments will not show on new deployments.

## Repository Structure
- `contracts/` - Solidity contracts + Hardhat config
- `frontend/` - Next.js app
- `metadata/` - sample metadata files
- `scripts/` - helper scripts

## Credits
Built by MIR (0xmirx) with Fhenix CoFHE.
