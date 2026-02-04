/**
 * Fhenix CoFHE Encryption Utilities for Sepolia Integration
 *
 * Uses cofhejs to generate proper InEuint32 inputs.
 */

import { cofhejs, Encryptable } from "cofhejs/web";
import { ethers } from "ethers";

// Sepolia Testnet Configuration for Fhenix CoFHE
export const SEPOLIA_CONFIG = {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: "https://rpc.sepolia.org",
    explorerUrl: "https://sepolia.etherscan.io",
};

let cofheInitialized = false;
let cachedSigner: ethers.Signer | null = null;
let cachedChainId: number | null = null;

export type CofheProvider = {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export type CofheSigner = {
    getAddress: () => Promise<string>;
    signTypedData: (
        domain: Record<string, unknown>,
        types: Record<string, Array<Record<string, string>>>,
        value: Record<string, unknown>
    ) => Promise<string>;
};

/**
 * Initialize cofhejs for encryption operations
 */
export async function initializeCofhe(
    ethersProvider: unknown,
    ethersSigner: unknown
): Promise<boolean> {
    if (cofheInitialized) {
        return true;
    }

    const initResult = await (cofhejs as any).initializeWithEthers({
        ethersProvider,
        ethersSigner,
        environment: "TESTNET",
        generatePermit: false,
    });

    if (!initResult || initResult.success === false) {
        const err = initResult?.error;
        throw new Error(err?.message || "CoFHE initialization failed");
    }

    cofheInitialized = true;
    if (ethersSigner && typeof (ethersSigner as ethers.Signer).getAddress === "function") {
        cachedSigner = ethersSigner as ethers.Signer;
    }
    if (ethersProvider && typeof (ethersProvider as ethers.providers.Provider).getNetwork === "function") {
        const network = await (ethersProvider as ethers.providers.Provider).getNetwork();
        cachedChainId = network?.chainId ?? null;
    }
    return true;
}

/**
 * Check if cofhejs is initialized
 */
export function isCofheInitialized(): boolean {
    return cofheInitialized;
}

export type PermissionStruct = {
    issuer: string;
    expiration: number;
    recipient: string;
    validatorId: number;
    validatorContract: string;
    sealingKey: `0x${string}`;
    issuerSignature: `0x${string}`;
    recipientSignature: `0x${string}`;
};

export async function getOrCreatePermit(
    issuer: string,
    contractAddress: string,
    chainId?: number,
    signer?: ethers.Signer
): Promise<PermissionStruct> {
    const activeSigner = signer ?? cachedSigner;
    if (!activeSigner) {
        throw new Error("Signer not available for permission creation");
    }

    const effectiveChainId = chainId ?? cachedChainId;
    if (!effectiveChainId) {
        throw new Error("Chain ID not available for permission creation");
    }

    const expiration = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const sealingKey = ethers.utils.hexlify(ethers.utils.randomBytes(32)) as `0x${string}`;

    const permission = {
        issuer,
        expiration,
        recipient: zeroAddress,
        validatorId: 0,
        validatorContract: zeroAddress,
        sealingKey,
    };

    const domain = {
        name: "ACL",
        version: "1",
        chainId: effectiveChainId,
        verifyingContract: contractAddress,
    };

    const types = {
        PermissionedV2IssuerSelf: [
            { name: "issuer", type: "address" },
            { name: "expiration", type: "uint64" },
            { name: "recipient", type: "address" },
            { name: "validatorId", type: "uint256" },
            { name: "validatorContract", type: "address" },
            { name: "sealingKey", type: "bytes32" },
        ],
    };

    const signature = await (activeSigner as ethers.Signer)._signTypedData(domain, types, permission);

    return {
        ...permission,
        issuerSignature: signature as `0x${string}`,
        recipientSignature: "0x",
    };
}

export async function unsealValue(sealed: `0x${string}`): Promise<number> {
    const value = await (cofhejs as any).unseal(sealed);
    return Number(value);
}

/**
 * Encrypt NFT rarity and attribute values for FhenixOGNFT contract
 * This creates properly formatted InEuint32 tuples using real FHE encryption
 *
 * @param rarity - Rarity score (1-100)
 * @param attribute - Special attribute value
 * @returns Object containing encrypted InEuint32 tuples
 */
export async function encryptNFTAttributes(
    rarity: number,
    attribute: number
): Promise<{
    encryptedRarity: {
        ctHash: bigint;
        securityZone: number;
        utype: number;
        signature: `0x${string}`;
    };
    encryptedAttribute: {
        ctHash: bigint;
        securityZone: number;
        utype: number;
        signature: `0x${string}`;
    };
}> {
    const rarityValue = Math.max(0, Math.min(4294967295, Math.floor(rarity)));
    const attributeValue = Math.max(0, Math.min(4294967295, Math.floor(attribute)));

    const encryptResult = await cofhejs.encrypt([
        Encryptable.uint32(rarityValue),
        Encryptable.uint32(attributeValue),
    ]);

    if (!encryptResult || encryptResult.success === false) {
        const err = encryptResult?.error;
        throw new Error(err?.message || "CoFHE encryption failed");
    }

    const [encryptedRarity, encryptedAttribute] = encryptResult.data;

    return {
        encryptedRarity,
        encryptedAttribute,
    };
}

/**
 * Check if running on Sepolia testnet
 * @param chainId - Current chain ID
 */
export function isSepoliaTestnet(chainId: number): boolean {
    return chainId === SEPOLIA_CONFIG.chainId;
}

/**
 * Get Sepolia faucet URL
 */
export function getSepoliaFaucetUrl(): string {
    return "https://sepoliafaucet.com";
}

// Export types
export type SepoliaConfig = typeof SEPOLIA_CONFIG;
