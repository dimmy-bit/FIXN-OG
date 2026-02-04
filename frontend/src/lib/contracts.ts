import abi from "./abi/FhenixOGNFT.json";

export const CONTRACT_ABI = abi as const;

// Contract address - set by deploy script into frontend/.env.local
export const CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Chain IDs
export const SEPOLIA_CHAIN_ID = 11155111;
export const FHENIX_TESTNET_CHAIN_ID = 42069;

// Mint price in ETH
export const MINT_PRICE = "0.001";

// Fhenix Testnet Configuration (for future use)
export const FHENIX_TESTNET = {
    id: FHENIX_TESTNET_CHAIN_ID,
    name: "Fhenix Testnet",
    network: "fhenix-testnet",
    nativeCurrency: {
        name: "Fhenix Token",
        symbol: "FHE",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://api.helium.fhenix.zone"],
        },
        public: {
            http: ["https://api.helium.fhenix.zone"],
        },
    },
    blockExplorers: {
        default: {
            name: "Fhenix Explorer",
            url: "https://explorer.helium.fhenix.zone",
        },
    },
    testnet: true,
};

// Sepolia Configuration
export const SEPOLIA_CONFIG = {
    id: SEPOLIA_CHAIN_ID,
    name: "Sepolia",
    network: "sepolia",
    nativeCurrency: {
        name: "Sepolia Ether",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://eth-sepolia.g.alchemy.com/v2/JkwlX2jl-1k1wTZQPFHuC-YYuLcoldZk"],
        },
        public: {
            http: ["https://rpc.sepolia.org"],
        },
    },
    blockExplorers: {
        default: {
            name: "Etherscan",
            url: "https://sepolia.etherscan.io",
        },
    },
    testnet: true,
};
