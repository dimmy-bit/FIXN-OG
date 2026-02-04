import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { SEPOLIA_CONFIG } from "./contracts";

// Configure RainbowKit with Sepolia Testnet
export const config = getDefaultConfig({
    appName: "FIXN OG NFT",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
    chains: [SEPOLIA_CONFIG],
    ssr: true,
});
