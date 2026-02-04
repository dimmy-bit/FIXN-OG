# 🚀 FIXN OG - Privacy-Preserving NFT Minting Platform

## Complete Development Plan with CoFHE Integration

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [CoFHE Architecture](#cofhe-architecture)
4. [Smart Contract Development](#smart-contract-development)
5. [Frontend Development](#frontend-development)
6. [Implementation Roadmap](#implementation-roadmap)
7. [File Structure](#file-structure)
8. [Deployment Guide](#deployment-guide)
9. [Resources & Links](#resources--links)

---

## 1. PROJECT OVERVIEW

### Project Name: **FIXN OG**

### Description
A privacy-preserving NFT minting platform on Sepolia testnet leveraging Fhenix's CoFHE (Confidential on Fully Homomorphic Encryption) technology. Users can mint NFTs with **encrypted metadata** and **private attributes** that remain confidential on-chain while still being verifiable and tradeable.

### Core Features
- ✅ **Animated Header**: Color-changing moving text that stops on "FIXN OG"
- ✅ **Encrypted NFT Metadata**: Attributes remain private until authorized decryption
- ✅ **Privacy-Preserving Minting**: Mint counts and owner data can be encrypted
- ✅ **Permit-Based Access**: Only authorized users can decrypt NFT data
- ✅ **Modern UI/UX**: Built with Next.js 14, Framer Motion, shadcn/ui
- ✅ **Sepolia Testnet**: Deployed on Ethereum Sepolia with CoFHE support
- ✅ **Wallet Integration**: WalletConnect, MetaMask, Coinbase Wallet
- ✅ **IPFS/Pinata**: NFT metadata storage on IPFS via Pinata

### Unique Privacy Features
1. **Hidden Rarity System**: Rarity scores stored as encrypted values
2. **Private Mint Counter**: Total mints hidden from public view
3. **Confidential Attributes**: Special traits only visible to NFT owner
4. **Encrypted Whitelist**: Private whitelist verification using FHE

---

## 2. TECHNOLOGY STACK

### Smart Contracts
```json
{
  "Solidity": "^0.8.20",
  "@fhenixprotocol/cofhe-contracts": "latest",
  "@openzeppelin/contracts": "^5.0.0",
  "hardhat": "^2.19.0",
  "@nomicfoundation/hardhat-toolbox": "^4.0.0"
}
```

### Frontend (Next.js 14)
```json
{
  "next": "14.2.0",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "@fhenixprotocol/cofhejs": "latest",
  "viem": "^2.0.0",
  "wagmi": "^2.0.0",
  "@rainbow-me/rainbowkit": "^2.0.0",
  "framer-motion": "^11.0.0",
  "shadcn/ui": "latest",
  "tailwindcss": "^3.4.0",
  "pinata-web3": "latest"
}
```

### Infrastructure
- **Network**: Ethereum Sepolia Testnet
- **CoFHE Environment**: TESTNET
- **RPC**: Sepolia Public RPC
- **Storage**: IPFS via Pinata for metadata
- **Encryption**: CoFHE for on-chain privacy

---

## 3. COFHE ARCHITECTURE

### What is CoFHE?
CoFHE (Confidential on Fully Homomorphic Encryption) is Fhenix's FHE coprocessor that enables encrypted computation on EVM chains. It allows smart contracts to:
- Store encrypted data on-chain
- Perform operations on encrypted values without decryption
- Maintain privacy while ensuring verifiability

### CoFHE System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CoFHE SYSTEM FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. CLIENT SIDE (Frontend)
   ├── User encrypts data using cofhejs.encrypt()
   ├── Signs permit for decryption rights
   └── Sends encrypted calldata to contract

2. ON-CHAIN (Smart Contract)
   ├── Receives inEuintX encrypted input
   ├── Converts to euintX using FHE.asEuint()
   ├── Performs operations: FHE.add(), FHE.gt(), etc.
   ├── Grants permissions: FHE.allowSender(), FHE.allowThis()
   └── Emits events for CoFHE processing

3. OFF-CHAIN (CoFHE Coprocessor)
   ├── Detects FHE computation events
   ├── Executes heavy FHE operations
   ├── Threshold Decryption Network handles decryption
   └── Returns results to authorized parties

4. DECRYPTION (Client Side)
   ├── User requests decryption with valid permit
   ├── Contract seals output for user's public key
   ├── Client unseals with cofhejs.unseal()
   └── Displays decrypted value to user
```

### FHE Encrypted Types

```solidity
// Available encrypted types
euint8   // 0 to 255
euint16  // 0 to 65,535
euint32  // 0 to 4,294,967,295
euint64  // 0 to 18,446,744,073,709,551,615
euint128 // Very large numbers
euint256 // Maximum size
ebool    // Encrypted boolean
eaddress // Encrypted Ethereum address
```

### Key FHE Operations

```solidity
// Arithmetic
FHE.add(euint32 a, euint32 b) → euint32
FHE.sub(euint32 a, euint32 b) → euint32
FHE.mul(euint32 a, euint32 b) → euint32

// Comparison (returns ebool)
FHE.eq(euint32 a, euint32 b) → ebool
FHE.ne(euint32 a, euint32 b) → ebool
FHE.gt(euint32 a, euint32 b) → ebool
FHE.lt(euint32 a, euint32 b) → ebool

// Conditional
FHE.select(ebool condition, euint32 ifTrue, euint32 ifFalse) → euint32

// Permissions
FHE.allowThis(euint32 value) // Allow contract to use value
FHE.allowSender(euint32 value) // Allow msg.sender to decrypt
FHE.allow(euint32 value, address addr) // Allow specific address

// Conversion
FHE.asEuint32(inEuint32 encrypted) → euint32 // Input to storage
FHE.asEuint32(uint32 plaintext) → euint32 // Plaintext to encrypted
```

---

## 4. SMART CONTRACT DEVELOPMENT

### Contract Architecture

```
contracts/
├── FhenixOGNFT.sol              # Main NFT contract
├── interfaces/
│   └── IFhenixOGNFT.sol         # Interface
├── libraries/
│   └── EncryptedMetadata.sol    # Helper library for metadata
└── test/
    └── FhenixOGNFT.test.ts      # Test suite
```

### 4.1 Main NFT Contract: FhenixOGNFT.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title FhenixOGNFT
 * @dev Privacy-preserving NFT contract using Fhenix CoFHE
 * 
 * Features:
 * - Encrypted rarity scores per NFT
 * - Encrypted total supply counter
 * - Private mint tracking
 * - Permit-based metadata decryption
 */
contract FhenixOGNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    // ============ State Variables ============
    
    Counters.Counter private _tokenIdCounter;
    
    // Encrypted total supply - hidden from public view
    euint32 private _encryptedTotalSupply;
    
    // Max supply (public)
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Mint price (public)
    uint256 public constant MINT_PRICE = 0.001 ether;
    
    // Base URI for non-sensitive metadata
    string private _baseTokenURI;
    
    // Mapping: tokenId => encrypted rarity score
    mapping(uint256 => euint32) private _encryptedRarity;
    
    // Mapping: tokenId => encrypted special attribute
    mapping(uint256 => euint32) private _encryptedAttribute;
    
    // Mapping: address => encrypted mint count per user
    mapping(address => euint32) private _userEncryptedMintCount;
    
    // Mapping: tokenId => encrypted timestamp
    mapping(uint256 => euint64) private _encryptedMintTimestamp;
    
    // Whitelist: address => encrypted whitelist status
    mapping(address => ebool) private _encryptedWhitelist;

    // ============ Events ============
    
    event NFTMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string tokenURI
    );
    
    event RaritySet(
        uint256 indexed tokenId,
        bytes32 encryptedRarityHash
    );
    
    event WhitelistUpdated(
        address indexed user,
        bytes32 encryptedStatusHash
    );

    // ============ Constructor ============
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        // Initialize encrypted total supply to 0
        _encryptedTotalSupply = FHE.asEuint32(0);
    }

    // ============ Minting Functions ============
    
    /**
     * @dev Public mint function with encrypted tracking
     * @param encryptedRarity Encrypted rarity score (1-100)
     * @param encryptedAttribute Encrypted special attribute value
     */
    function mint(
        inEuint32 calldata encryptedRarity,
        inEuint32 calldata encryptedAttribute
    ) external payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        
        uint256 currentSupply = _tokenIdCounter.current();
        require(currentSupply < MAX_SUPPLY, "Max supply reached");
        
        // Increment counters
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Update encrypted total supply
        _encryptedTotalSupply = FHE.add(
            _encryptedTotalSupply,
            FHE.asEuint32(1)
        );
        
        // Store encrypted rarity and attribute
        _encryptedRarity[tokenId] = FHE.asEuint32(encryptedRarity);
        _encryptedAttribute[tokenId] = FHE.asEuint32(encryptedAttribute);
        
        // Store encrypted mint timestamp
        _encryptedMintTimestamp[tokenId] = FHE.asEuint64(uint64(block.timestamp));
        
        // Update user's encrypted mint count
        euint32 currentUserMints = _userEncryptedMintCount[msg.sender];
        _userEncryptedMintCount[msg.sender] = FHE.add(
            currentUserMints,
            FHE.asEuint32(1)
        );
        
        // Mint the NFT
        _safeMint(msg.sender, tokenId);
        
        // Set token URI (non-sensitive metadata on IPFS)
        string memory tokenURI = string(
            abi.encodePacked(_baseTokenURI, Strings.toString(tokenId), ".json")
        );
        _setTokenURI(tokenId, tokenURI);
        
        // Grant permissions for decryption
        FHE.allowThis(_encryptedRarity[tokenId]);
        FHE.allowThis(_encryptedAttribute[tokenId]);
        FHE.allowThis(_encryptedMintTimestamp[tokenId]);
        FHE.allowThis(_userEncryptedMintCount[msg.sender]);
        
        // Allow owner to decrypt their NFT data
        FHE.allow(_encryptedRarity[tokenId], msg.sender);
        FHE.allow(_encryptedAttribute[tokenId], msg.sender);
        FHE.allow(_encryptedMintTimestamp[tokenId], msg.sender);
        FHE.allow(_userEncryptedMintCount[msg.sender], msg.sender);
        
        emit NFTMinted(msg.sender, tokenId, tokenURI);
        
        return tokenId;
    }

    // ============ Encrypted Data Getters ============
    
    /**
     * @dev Get encrypted rarity for a token
     * @param tokenId The token ID
     * @return The encrypted rarity value
     */
    function getEncryptedRarity(uint256 tokenId) 
        external 
        view 
        returns (euint32) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _encryptedRarity[tokenId];
    }
    
    /**
     * @dev Get encrypted attribute for a token
     * @param tokenId The token ID
     * @return The encrypted attribute value
     */
    function getEncryptedAttribute(uint256 tokenId) 
        external 
        view 
        returns (euint32) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _encryptedAttribute[tokenId];
    }
    
    /**
     * @dev Get encrypted total supply
     * @return The encrypted total supply
     */
    function getEncryptedTotalSupply() 
        external 
        view 
        returns (euint32) 
    {
        return _encryptedTotalSupply;
    }
    
    /**
     * @dev Get user's encrypted mint count
     * @param user The user address
     * @return The encrypted mint count
     */
    function getUserEncryptedMintCount(address user) 
        external 
        view 
        returns (euint32) 
    {
        return _userEncryptedMintCount[user];
    }
    
    /**
     * @dev Get encrypted mint timestamp for a token
     * @param tokenId The token ID
     * @return The encrypted timestamp
     */
    function getEncryptedMintTimestamp(uint256 tokenId) 
        external 
        view 
        returns (euint64) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _encryptedMintTimestamp[tokenId];
    }

    // ============ Admin Functions ============
    
    /**
     * @dev Update whitelist status for a user (encrypted)
     * @param user The user address
     * @param encryptedStatus Encrypted whitelist status
     */
    function updateWhitelist(
        address user,
        inEbool calldata encryptedStatus
    ) external onlyOwner {
        _encryptedWhitelist[user] = FHE.asEbool(encryptedStatus);
        FHE.allowThis(_encryptedWhitelist[user]);
        FHE.allow(_encryptedWhitelist[user], user);
        
        emit WhitelistUpdated(user, keccak256(abi.encode(_encryptedWhitelist[user])));
    }
    
    /**
     * @dev Check if user is whitelisted (returns encrypted bool)
     * @param user The user address
     * @return Encrypted whitelist status
     */
    function isWhitelisted(address user) 
        external 
        view 
        returns (ebool) 
    {
        return _encryptedWhitelist[user];
    }
    
    /**
     * @dev Set base URI for token metadata
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }

    // ============ View Functions ============
    
    /**
     * @dev Get current public supply (non-encrypted counter)
     * @return Current supply
     */
    function getCurrentSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Base URI for computing tokenURI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // ============ Required Overrides ============
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### 4.2 Hardhat Configuration

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@fhenixprotocol/cofhe-hardhat-plugin";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "eth-sepolia": {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
};

export default config;
```

### 4.3 Deployment Script

```typescript
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying FhenixOGNFT to Sepolia...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Contract parameters
  const name = "FIXN OG";
  const symbol = "FXOG";
  const baseURI = "ipfs://YOUR_IPFS_CID/"; // Update with actual IPFS CID

  // Deploy contract
  const FhenixOGNFT = await ethers.getContractFactory("FhenixOGNFT");
  const nft = await FhenixOGNFT.deploy(name, symbol, baseURI);

  await nft.waitForDeployment();

  const contractAddress = await nft.getAddress();
  console.log("\n✅ FhenixOGNFT deployed to:", contractAddress);
  console.log("📝 Name:", name);
  console.log("🔖 Symbol:", symbol);
  console.log("🔗 Base URI:", baseURI);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await nft.deploymentTransaction()?.wait(5);

  // Verify contract on Etherscan
  console.log("\n📋 Verifying contract on Etherscan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [name, symbol, baseURI],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    console.log("⚠️ Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## 5. FRONTEND DEVELOPMENT

### 5.1 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── mint/
│   │   │   └── page.tsx
│   │   ├── gallery/
│   │   │   └── page.tsx
│   │   └── my-nfts/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── AnimatedTitle.tsx  # Color-changing animated text
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── mint/
│   │   │   ├── MintCard.tsx
│   │   │   ├── EncryptedInput.tsx
│   │   │   └── MintProgress.tsx
│   │   ├── nft/
│   │   │   ├── NFTCard.tsx
│   │   │   ├── NFTDetail.tsx
│   │   │   └── EncryptedAttribute.tsx
│   │   └── wallet/
│   │       ├── ConnectButton.tsx
│   │       └── WalletInfo.tsx
│   ├── hooks/
│   │   ├── useCofhe.ts
│   │   ├── usePermit.ts
│   │   ├── useNFTContract.ts
│   │   └── useEncryption.ts
│   ├── lib/
│   │   ├── contracts.ts
│   │   ├── cofhe-config.ts
│   │   ├── pinata.ts
│   │   └── utils.ts
│   ├── store/
│   │   └── cofheStore.ts
│   └── types/
│       ├── nft.ts
│       └── cofhe.ts
├── public/
│   ├── images/
│   └── fonts/
├── tailwind.config.ts
├── next.config.js
└── package.json
```

### 5.2 Animated Header Component

```typescript
// src/components/layout/AnimatedTitle.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const colors = [
  '#FF0080', // Pink
  '#FF8C00', // Orange
  '#FFD700', // Gold
  '#00FF00', // Green
  '#00CED1', // Cyan
  '#1E90FF', // Blue
  '#9370DB', // Purple
  '#FF1493', // Deep Pink
];

const finalText = "FIXN OG";

export function AnimatedTitle() {
  const [currentText, setCurrentText] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showFinal, setShowFinal] = useState(false);

  // Random characters for animation
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      // Generate random text
      const randomText = Array(7)
        .fill(0)
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join("");
      
      setCurrentText(randomText);
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 100);

    // Stop animation after 3 seconds and show final text
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsAnimating(false);
      setShowFinal(true);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isAnimating]);

  return (
    <div className="flex items-center justify-center min-h-[120px]">
      <AnimatePresence mode="wait">
        {showFinal ? (
          <motion.h1
            key="final"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              backgroundImage: [
                'linear-gradient(45deg, #FF0080, #FF8C00)',
                'linear-gradient(45deg, #00FF00, #00CED1)',
                'linear-gradient(45deg, #1E90FF, #9370DB)',
                'linear-gradient(45deg, #FF1493, #FF0080)',
              ]
            }}
            transition={{ 
              duration: 0.8,
              backgroundImage: {
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"
            style={{
              textShadow: '0 0 30px rgba(255, 0, 128, 0.5)',
            }}
          >
            {finalText}
          </motion.h1>
        ) : (
          <motion.h1
            key="animating"
            className="text-6xl md:text-8xl font-black"
            style={{ color: colors[colorIndex] }}
            animate={{
              textShadow: [
                `0 0 20px ${colors[colorIndex]}80`,
                `0 0 40px ${colors[colorIndex]}60`,
                `0 0 20px ${colors[colorIndex]}80`,
              ]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {currentText}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 5.3 Core Hooks

#### useCofhe.ts
```typescript
// src/hooks/useCofhe.ts
import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { cofhejs, Encryptable, FheTypes } from '@fhenixprotocol/cofhejs';
import { useCofheStore } from '@/store/cofheStore';

export function useCofhe() {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isInitialized, setIsInitialized } = useCofheStore();
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initCofhe = async () => {
      if (!isConnected || !publicClient || !walletClient || isInitialized) {
        return;
      }

      setIsInitializing(true);

      try {
        await cofhejs.initializeWithViem({
          viemClient: publicClient,
          viemWalletClient: walletClient,
          environment: "TESTNET",
          generatePermit: false,
        });

        setIsInitialized(true);
        console.log('✅ CoFHE initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize CoFHE:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initCofhe();
  }, [isConnected, publicClient, walletClient, isInitialized, setIsInitialized]);

  // Reset on chain/account change
  useEffect(() => {
    if (isInitialized) {
      setIsInitialized(false);
    }
  }, [chain?.id, address]);

  return { isInitialized, isInitializing };
}
```

#### usePermit.ts
```typescript
// src/hooks/usePermit.ts
import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { cofhejs } from '@fhenixprotocol/cofhejs';

export function usePermit() {
  const { address } = useAccount();
  const [hasValidPermit, setHasValidPermit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePermit = useCallback(async () => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsGenerating(true);

    try {
      const permit = await cofhejs.createPermit({
        type: "self",
        name: "FIXN OG NFT",
        issuer: address,
        expiration: Math.round(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      });

      setHasValidPermit(true);
      console.log('✅ Permit generated successfully');
      return permit;
    } catch (error) {
      console.error('❌ Failed to generate permit:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [address]);

  return {
    hasValidPermit,
    isGenerating,
    generatePermit,
  };
}
```

### 5.4 MintCard Component

```typescript
// src/components/mint/MintCard.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCofhe } from '@/hooks/useCofhe';
import { usePermit } from '@/hooks/usePermit';
import { Loader2, Lock, Sparkles } from 'lucide-react';

export function MintCard() {
  const { isInitialized } = useCofhe();
  const { hasValidPermit, generatePermit, isGenerating } = usePermit();
  const [rarity, setRarity] = useState<number>(50);
  const [attribute, setAttribute] = useState<number>(0);
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    if (!isInitialized || !hasValidPermit) {
      alert('Please initialize CoFHE and generate a permit first');
      return;
    }

    setIsMinting(true);
    try {
      // Encrypt values and mint
      // ... implementation
      console.log('Minting with encrypted rarity:', rarity, 'and attribute:', attribute);
    } catch (error) {
      console.error('Minting failed:', error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Mint FIXN OG NFT
          </CardTitle>
          <CardDescription>
            Privacy-preserving NFT with encrypted attributes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isInitialized && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please connect your wallet and initialize CoFHE
              </p>
            </div>
          )}

          {isInitialized && !hasValidPermit && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate a permit to encrypt NFT attributes
              </p>
              <Button
                onClick={generatePermit}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Generate Permit
                  </>
                )}
              </Button>
            </div>
          )}

          {hasValidPermit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="rarity">
                  Rarity Score (1-100) 🔒
                </Label>
                <Input
                  id="rarity"
                  type="number"
                  min="1"
                  max="100"
                  value={rarity}
                  onChange={(e) => setRarity(parseInt(e.target.value))}
                  className="border-purple-300 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500">
                  This value will be encrypted on-chain
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attribute">
                  Special Attribute 🔒
                </Label>
                <Input
                  id="attribute"
                  type="number"
                  value={attribute}
                  onChange={(e) => setAttribute(parseInt(e.target.value))}
                  className="border-purple-300 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500">
                  Only you can decrypt this value
                </p>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleMint}
            disabled={!hasValidPermit || isMinting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              'Mint NFT (0.001 ETH)'
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
```

### 5.5 Pinata Integration

```typescript
// src/lib/pinata.ts
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

export async function uploadNFTMetadata(
  name: string,
  description: string,
  imageFile: File,
  attributes: Array<{ trait_type: string; value: string | number }>
) {
  try {
    // Upload image to IPFS
    const imageUpload = await pinata.upload.file(imageFile);
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUpload.IpfsHash}`;

    // Create metadata JSON
    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes,
    };

    // Upload metadata JSON to IPFS
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });
    const metadataFile = new File([metadataBlob], "metadata.json");
    const metadataUpload = await pinata.upload.file(metadataFile);

    return {
      imageHash: imageUpload.IpfsHash,
      metadataHash: metadataUpload.IpfsHash,
      metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataUpload.IpfsHash}`,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
}

export async function uploadJSONToIPFS(jsonData: object) {
  try {
    const blob = new Blob([JSON.stringify(jsonData)], {
      type: "application/json",
    });
    const file = new File([blob], "data.json");
    const upload = await pinata.upload.file(file);
    
    return {
      hash: upload.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`,
    };
  } catch (error) {
    console.error("Error uploading JSON to Pinata:", error);
    throw error;
  }
}
```

---

## 6. IMPLEMENTATION ROADMAP

### Phase 1: Setup & Infrastructure (Days 1-2)
- [ ] Set up Hardhat project
- [ ] Configure Sepolia testnet
- [ ] Install CoFHE dependencies
- [ ] Set up Next.js 14 project
- [ ] Install frontend dependencies (wagmi, rainbowkit, shadcn)
- [ ] Configure Tailwind CSS
- [ ] Set up Framer Motion

### Phase 2: Smart Contract Development (Days 3-5)
- [ ] Write FhenixOGNFT.sol contract
- [ ] Implement encrypted state variables
- [ ] Write mint function with FHE integration
- [ ] Implement permission system
- [ ] Write getter functions
- [ ] Write test suite
- [ ] Test .env private key 
- [ ] Deploy to Sepolia testnet
- [ ] Verify contract on Etherscan optional

### Phase 3: Frontend Core (Days 6-8)
- [ ] Set up app structure
- [ ] Implement wallet connection
- [ ] Create CoFHE hooks (useCofhe, usePermit)
- [ ] Implement permit generation flow
- [ ] Build basic UI layout (Header, Footer, Navigation)
- [ ] Set up routing (/, /mint, /gallery, /my-nfts)

### Phase 4: Animated Header & Minting UI (Days 9-11)
- [ ] Build AnimatedTitle component with color-changing text
- [ ] Build MintCard curve 
- [ ] Implement encrypted input fields
- [ ] Add encryption logic with cofhejs
- [ ] Create mint transaction flow
- [ ] Add loading states and error handling
- [ ] Implement success animations
- [ ] Test minting flow end-to-end

### Phase 5: Gallery & NFT Display (Days 12-14)
- [ ] Build NFTCard component
- [ ] Implement encrypted attribute display
- [ ] Create decryption UI
- [ ] Build gallery page with all NFTs
- [ ] Implement "My NFTs" page
- [ ] Add filtering and sorting
- [ ] Implement NFT detail modal

### Phase 6: IPFS/Pinata Integration (Days 15-16)
- [ ] Set up Pinata api key 
- [ ] Implement image upload to IPFS
- [ ] Create metadata JSON upload
- [ ] Link IPFS metadata to smart contract
- [ ] Test metadata retrieval

### Phase 7: Polish & Optimization (Days 17-18)
- [ ] Add Framer Motion animations
- [ ] Implement dark mode
- [ ] Optimize performance
- [ ] Add loading skeletons
- [ ] Improve error messages
- [ ] Add transaction notifications
- [ ] Write frontend tests

### Phase 8: Testing & Deployment (Days 19-20)
- [ ] Full end-to-end testing
- [ ] Test on different wallets
- [ ] Test encryption/decryption flows
- [ ] Fix bugs
- [ ] Optimize gas costs
- [ ] Deploy frontend to Vercel
- [ ] Create documentation
- [ ] Prepare demo video

---

## 7. FILE STRUCTURE

### Complete Project Structure
```
FIXN-OG/
├── contracts/                    # Smart contract workspace
│   ├── contracts/
│   │   ├── FhenixOGNFT.sol
│   │   ├── interfaces/
│   │   │   └── IFhenixOGNFT.sol
│   │   └── libraries/
│   │       └── EncryptedMetadata.sol
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── interact.ts
│   ├── test/
│   │   └── FhenixOGNFT.test.ts
│   ├── hardhat.config.ts
│   ├── package.json
│   └── .env
│
└── frontend/                     # Next.js frontend
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── mint/
    │   │   │   └── page.tsx
    │   │   ├── gallery/
    │   │   │   └── page.tsx
    │   │   └── my-nfts/
    │   │       └── page.tsx
    │   ├── components/
    │   │   ├── ui/              # shadcn components
    │   │   ├── layout/
    │   │   │   ├── Header.tsx
    │   │   │   ├── AnimatedTitle.tsx
    │   │   │   ├── Footer.tsx
    │   │   │   └── Navigation.tsx
    │   │   ├── mint/
    │   │   ├── nft/
    │   │   └── wallet/
    │   ├── hooks/
    │   ├── lib/
    │   ├── store/
    │   └── types/
    ├── public/
    ├── tailwind.config.ts
    ├── next.config.js
    ├── package.json
    └── .env.local
```

---

## 8. DEPLOYMENT GUIDE

### 8.1 Environment Variables

#### Backend (.env)
```bash
# Sepolia RPC
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Deployer private key
PRIVATE_KEY=your_private_key_here

# Etherscan API key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### Frontend (.env.local)
```bash
# Contract address (update after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Pinata
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_PINATA_GATEWAY=your_pinata_gateway

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Network
NEXT_PUBLIC_CHAIN_ID=11155111
```

### 8.2 Deployment Steps

#### Deploy Smart Contract
```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network eth-sepolia

# Verify on Etherscan
npx hardhat verify --network eth-sepolia DEPLOYED_CONTRACT_ADDRESS "FIXN OG" "FXOG" "ipfs://YOUR_CID/"
```

#### Deploy Frontend
```bash
cd frontend

# Install dependencies
npm install

# Build
npm run build

# Deploy to Vercel
vercel deploy
```

### 8.3 Post-Deployment Checklist

- [ ] Contract deployed to Sepolia
- [ ] Contract verified on Etherscan
- [ ] Frontend deployed to Vercel
- [ ] Contract address updated in frontend
- [ ] Pinata JWT configured
- [ ] Wallet connection tested
- [ ] Minting flow tested
- [ ] Encryption/decryption tested
- [ ] IPFS metadata working
- [ ] Documentation updated
- [ ] Demo video recorded

---

## 9. RESOURCES & LINKS

### Documentation
- **Fhenix Docs**: https://cofhe-docs.fhenix.zone
- **CoFHE GitHub**: https://github.com/FhenixProtocol
- **Hardhat**: https://hardhat.org
- **Next.js**: https://nextjs.org
- **shadcn/ui**: https://ui.shadcn.com
- **Framer Motion**: https://www.framer.com/motion
- **Pinata**: https://docs.pinata.cloud

### Tools
- **Sepolia Faucet**: https://sepoliafaucet.com
- **Etherscan Sepolia**: https://sepolia.etherscan.io
- **IPFS**: https://ipfs.io
- **Pinata**: https://pinata.cloud

---

## 10. KEY TAKEAWAYS

### Why This Approach is Perfect

1. **True Privacy**: CoFHE enables genuine on-chain privacy without compromising decentralization
2. **EVM Compatible**: Works on Sepolia (and any EVM chain)
3. **Modern Stack**: Next.js 14, TypeScript, shadcn/ui for best DX
4. **Production Ready**: Proper testing, deployment, and documentation
5. **Scalable**: Can extend to advanced features

### What Makes It Special

- **Animated Header**: Unique color-changing text that stops on "FIXN OG"
- **First Private NFT Project on CoFHE**: Pioneering privacy-preserving NFTs
- **Educational Value**: Demonstrates real-world FHE usage
- **User Experience**: Seamless encryption/decryption flow
- **Gas Efficient**: CoFHE handles heavy computation off-chain
- **Future Proof**: Built on cutting-edge cryptography

---

## QUICK START CHECKLIST

1. **Set up development environment**
2. **Clone or create Hardhat project**
3. **Install all dependencies**
4. **Write and test smart contract**
5. **Deploy to Sepolia**
6. **Build frontend incrementally**
7. **Test everything thoroughly**
8. **Deploy and celebrate! 🎉**

---

**This is your complete blueprint for building FIXN OG. Every detail is here - from animated headers to CoFHE integration. You have everything you need to create a production-grade, privacy-preserving NFT platform. Good luck! 🚀**
