"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contracts";
import { NFTCard } from "@/components/nft/NFTCard";
import { Skeleton } from "@/components/ui/skeleton";

interface NFT {
    tokenId: number;
    imageUrl: string;
    name: string;
    description: string;
    owner: string;
    encryptedRarity: string;
    encryptedAttribute: string;
}

type ViewMode = "all" | "owned";

type NFTGalleryProps = {
    initialMode?: ViewMode;
    showModeToggle?: boolean;
};

function normalizeTokenUri(uri: string): string {
    if (!uri) return "";
    if (uri.startsWith("ipfs://")) {
        return `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`;
    }
    return uri;
}

export function NFTGallery({ initialMode = "all", showModeToggle = false }: NFTGalleryProps) {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

    const { data: totalSupply } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "getCurrentSupply",
    });

    useEffect(() => {
        let active = true;

        async function loadNFTs() {
            if (!publicClient) return;
            setLoading(true);
            setError(null);

            const supply = Number(totalSupply ?? 0);
            if (!supply) {
                setNfts([]);
                setLoading(false);
                return;
            }

            try {
                const ids = Array.from({ length: supply }, (_, i) => i);
                const items = await Promise.all(
                    ids.map(async (id) => {
                        const tokenId = BigInt(id);
                        const owner = await publicClient.readContract({
                            address: CONTRACT_ADDRESS as `0x${string}`,
                            abi: CONTRACT_ABI,
                            functionName: "ownerOf",
                            args: [tokenId],
                        });

                        const tokenUriRaw = await publicClient.readContract({
                            address: CONTRACT_ADDRESS as `0x${string}`,
                            abi: CONTRACT_ABI,
                            functionName: "tokenURI",
                            args: [tokenId],
                        });

                        const tokenUri = normalizeTokenUri(String(tokenUriRaw));

                        let metadata: { name?: string; description?: string; image?: string } | null = null;
                        if (tokenUri) {
                            try {
                                const response = await fetch(tokenUri);
                                metadata = await response.json();
                            } catch {
                                metadata = null;
                            }
                        }

                        return {
                            tokenId: id,
                            imageUrl: metadata?.image ? normalizeTokenUri(metadata.image) : "https://via.placeholder.com/400x400/111111/ffffff?text=FIXN+OG",
                            name: metadata?.name || `FIXN OG #${id}`,
                            description: metadata?.description || "",
                            owner: String(owner),
                            encryptedRarity: "",
                            encryptedAttribute: "",
                        } as NFT;
                    })
                );

                if (!active) return;
                setNfts(items);
            } catch (err) {
                if (!active) return;
                setError(err instanceof Error ? err.message : "Failed to load NFTs");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadNFTs();
        return () => {
            active = false;
        };
    }, [publicClient, totalSupply]);

    const filteredNFTs = useMemo(() => {
        if (viewMode === "owned" && address) {
            return nfts.filter((nft) => nft.owner.toLowerCase() === address.toLowerCase());
        }
        return nfts;
    }, [nfts, viewMode, address]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {showModeToggle && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center gap-2"
                >
                    <button
                        type="button"
                        onClick={() => setViewMode("all")}
                        className={[
                            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                            viewMode === "all"
                                ? "bg-white text-black"
                                : "border border-white/30 text-white hover:bg-white/10",
                        ].join(" ")}
                    >
                        All NFTs
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("owned")}
                        className={[
                            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                            viewMode === "owned"
                                ? "bg-white text-black"
                                : "border border-white/30 text-white hover:bg-white/10",
                        ].join(" ")}
                    >
                        My NFTs
                    </button>
                </motion.div>
            )}

            {error && (
                <div className="text-center text-sm text-red-300">
                    {error}
                </div>
            )}

            {filteredNFTs.length === 0 ? (
                <div className="text-center py-12 text-white/60">
                    {viewMode === "owned"
                        ? "You do not own any NFTs yet. Go mint one!"
                        : "No NFTs found."}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNFTs.map((nft, index) => (
                        <motion.div
                            key={nft.tokenId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <NFTCard
                                tokenId={nft.tokenId}
                                imageUrl={nft.imageUrl}
                                name={nft.name}
                                description={nft.description}
                                owner={nft.owner}
                                encryptedRarity={nft.encryptedRarity}
                                encryptedAttribute={nft.encryptedAttribute}
                                isOwned={address ? nft.owner.toLowerCase() === address.toLowerCase() : false}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
