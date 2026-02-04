"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contracts";
import { initializeCofhe, isCofheInitialized, getOrCreatePermit } from "@/lib/fhenix";
import { ethers } from "ethers";

interface NFTCardProps {
  tokenId: number;
  imageUrl: string;
  name: string;
  description?: string;
  owner: string;
  encryptedRarity: string;
  encryptedAttribute: string;
  isOwned: boolean;
  mintedAt?: string;
}

export function NFTCard({
  tokenId,
  imageUrl,
  name,
  description,
  owner,
  encryptedRarity,
  encryptedAttribute,
  isOwned,
  mintedAt,
}: NFTCardProps) {
  const fallbackImageUrl = "https://via.placeholder.com/400x400/111111/ffffff?text=FIXN+OG";
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedRarity, setDecryptedRarity] = useState<number | null>(null);
  const [decryptedAttribute, setDecryptedAttribute] = useState<number | null>(null);
  const [decryptStatus, setDecryptStatus] = useState<string | null>(null);
  const [decryptPending, setDecryptPending] = useState(false);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [permissionedSupported, setPermissionedSupported] = useState(true);

  const { address, connector, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const handleDecrypt = async (force = false) => {
    if (!isOwned) {
      alert("Only the owner can decrypt NFT attributes.");
      return;
    }

    if (showDecrypted && !force) {
      setShowDecrypted(false);
      return;
    }

    if (!publicClient || !isConnected || !address) {
      alert("Public client not ready.");
      return;
    }

    setIsDecrypting(true);
    setDecryptPending(false);
    console.log("Decrypt: start", { tokenId, address });
    setDecryptStatus("Creating permit...");

    try {
      if (!connector) {
        throw new Error("Wallet connector not available");
      }

      const provider = await connector.getProvider();
      const ethersProvider = new ethers.providers.Web3Provider(provider as any);
      const ethersSigner = ethersProvider.getSigner();

      if (!isCofheInitialized()) {
        await initializeCofhe(ethersProvider, ethersSigner);
      }

      const chainId = await ethersProvider.getNetwork().then((network) => network.chainId);
      const permission = await getOrCreatePermit(
        address,
        CONTRACT_ADDRESS as `0x${string}`,
        chainId,
        ethersSigner
      );

      setDecryptStatus("Preparing decrypt...");
      setAutoRetryCount(0);

      let usePermissioned = permissionedSupported;

      if (usePermissioned) {
        try {
          await publicClient.simulateContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: "requestDecryptAllWithPermission",
            args: [tokenId, permission],
            account: address as `0x${string}`,
          });
        } catch (simErr) {
          console.warn("Permissioned decrypt simulation failed, using owner flow:", simErr);
          usePermissioned = false;
          setPermissionedSupported(false);
        }
      }

      setDecryptStatus(usePermissioned ? "Submitting decrypt request..." : "Submitting owner decrypt...");

      if (usePermissioned) {
        const decryptTx = await writeContractAsync({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: "requestDecryptAllWithPermission",
          args: [tokenId, permission],
        });
        await publicClient.waitForTransactionReceipt({ hash: decryptTx });
        console.log("Decrypt: permissioned tx confirmed", { tokenId, tx: decryptTx });
      } else {
        const decryptTx = await writeContractAsync({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: "requestDecryptAll",
          args: [tokenId],
        });
        await publicClient.waitForTransactionReceipt({ hash: decryptTx });
        console.log("Decrypt: owner tx confirmed", { tokenId, tx: decryptTx });
      }

      let rarityValue: number | null = null;
      let attributeValue: number | null = null;

      const maxAttempts = 20;
      for (let i = 0; i < maxAttempts; i += 1) {
        setDecryptStatus("Decrypting...");

        const rarityResult = (await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: usePermissioned ? "getDecryptedRarityWithPermission" : "getDecryptedRarity",
          args: usePermissioned ? [tokenId, permission] : [tokenId],
          account: address as `0x${string}`,
        })) as [number, boolean];

        const attributeResult = (await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: usePermissioned ? "getDecryptedAttributeWithPermission" : "getDecryptedAttribute",
          args: usePermissioned ? [tokenId, permission] : [tokenId],
          account: address as `0x${string}`,
        })) as [number, boolean];

        if (rarityResult[1] && attributeResult[1]) {
          rarityValue = Number(rarityResult[0]);
          attributeValue = Number(attributeResult[0]);
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (rarityValue === null || attributeValue === null) {
        setDecryptPending(true);
        setDecryptStatus("Decrypt still pending. Click to retry.");
        return;
      }

      setDecryptedRarity(rarityValue);
      setDecryptedAttribute(attributeValue);
      setShowDecrypted(true);
      setDecryptPending(false);
      setDecryptStatus(null);
      console.log("Decrypt: success", { tokenId, rarity: rarityValue, attribute: attributeValue });
    } catch (error) {
      console.error("Decryption failed:", error);
      setDecryptPending(false);
      setDecryptStatus(null);
      alert(error instanceof Error ? error.message : "Decryption failed");
    } finally {
      setIsDecrypting(false);
    }
  };

  const truncateAddress = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-[#0f1220] border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] bg-black/30">
            <img
              src={imageUrl || fallbackImageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackImageUrl;
              }}
            />
            {isOwned && (
              <Badge className="absolute top-2 right-2 bg-emerald-500 text-black hover:bg-emerald-400">
                Owned
              </Badge>
            )}
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-black/60 text-white border border-white/10">
                #{tokenId}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 space-y-2">
          <h3 className="text-base font-semibold text-white truncate">
            {name}
          </h3>

          {description && (
            <p className="text-xs text-white/60 line-clamp-1">
              {description}
            </p>
          )}

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Owner:</span>
              <span className="font-mono text-fuchsia-300">
                {truncateAddress(owner)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Rarity:</span>
              <div className="flex items-center gap-2">
                {showDecrypted && decryptedRarity !== null ? (
                  <Badge
                    variant={decryptedRarity >= 80 ? "destructive" : decryptedRarity >= 50 ? "default" : "secondary"}
                  >
                    {decryptedRarity}/100
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-white/20 text-white/80">
                    <Lock className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Attribute:</span>
              <div className="flex items-center gap-2">
                {showDecrypted && decryptedAttribute !== null ? (
                  <Badge variant="secondary">{decryptedAttribute}</Badge>
                ) : (
                  <Badge variant="outline" className="border-white/20 text-white/80">
                    <Lock className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                )}
              </div>
            </div>

            {mintedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Minted:</span>
                <span className="text-white/50">
                  {new Date(mintedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {decryptStatus && (
            <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded px-2 py-1">
              {decryptStatus}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          {isOwned ? (
            <Button
              onClick={() => handleDecrypt(false)}
              disabled={isDecrypting}
              className="w-full bg-gradient-to-r from-fuchsia-500 to-sky-500 text-black font-semibold hover:from-fuchsia-400 hover:to-sky-400"
            >
              {isDecrypting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {decryptPending ? "Decrypt Pending..." : "Decrypting..."}
                </>
              ) : showDecrypted ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide Attributes
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  {decryptPending ? "Retry Decrypt" : "Decrypt Attributes"}
                </>
              )}
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              className="w-full opacity-50 cursor-not-allowed border-white/10 text-white"
            >
              <Lock className="mr-2 h-4 w-4" />
              Not Owned
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
