"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { ethers } from "ethers";
import { Loader2, Lock, Sparkles, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTRACT_ABI, CONTRACT_ADDRESS, MINT_PRICE } from "@/lib/contracts";
import { uploadNFTMetadata } from "@/lib/pinata";
import { initializeCofhe, encryptNFTAttributes, isCofheInitialized } from "@/lib/fhenix";

type StatusType = "info" | "error" | "success" | null;

export function MintCard() {
  const { address, isConnected, connector } = useAccount();
  const { writeContract, isPending, isSuccess, isError, error } = useWriteContract();

  const [rarity, setRarity] = useState<number>(50);
  const [attribute, setAttribute] = useState<number>(0);
  const [nftName, setNftName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<StatusType>(null);
  const [mintSuccess, setMintSuccess] = useState(false);

  useEffect(() => {
    async function initCofhe() {
      if (isConnected && connector && !isCofheInitialized()) {
        try {
          const provider = await connector.getProvider();
          const ethersProvider = new ethers.providers.Web3Provider(
            provider as ethers.providers.ExternalProvider
          );
          const ethersSigner = ethersProvider.getSigner();

          await initializeCofhe(ethersProvider, ethersSigner);
        } catch (err) {
          console.error("CoFHE init failed:", err);
          setStatusType("error");
          setStatusMessage("CoFHE init failed. Please reconnect your wallet.");
        }
      }
    }
    initCofhe();
  }, [isConnected, connector]);

  useEffect(() => {
    if (isSuccess) {
      setMintSuccess(true);
      setStatusType("success");
      setStatusMessage("Mint transaction submitted. Check your wallet for status.");
      setTimeout(() => {
        setNftName("");
        setDescription("");
        setImageFile(null);
        setImagePreview("");
        setRarity(50);
        setAttribute(0);
        setMintSuccess(false);
      }, 3000);
    }
  }, [isSuccess]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatusType("error");
      setStatusMessage("Image size must be less than 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatusType("error");
      setStatusMessage("Please upload a valid image file.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      setStatusType("error");
      setStatusMessage("Connect your wallet to mint.");
      return;
    }

    if (!isCofheInitialized()) {
      setStatusType("error");
      setStatusMessage("CoFHE is still initializing. Try again in a moment.");
      return;
    }

    if (!imageFile) {
      setStatusType("error");
      setStatusMessage("Please upload an image.");
      return;
    }

    if (!nftName.trim()) {
      setStatusType("error");
      setStatusMessage("Please enter an NFT name.");
      return;
    }

    console.log("Mint start:", { address, contract: CONTRACT_ADDRESS });
    setIsUploading(true);
    setStatusMessage("Uploading metadata to IPFS...");
    setStatusType("info");

    try {
      const attributes = [
        { trait_type: "Rarity", value: rarity },
        { trait_type: "Special Attribute", value: attribute },
      ];

      const { metadataHash } = await uploadNFTMetadata(
        nftName,
        description || `${nftName} - A privacy-preserving NFT from FIXN OG`,
        imageFile,
        attributes
      );

      setIsEncrypting(true);
      setStatusMessage("Encrypting attributes with CoFHE...");
      const { encryptedRarity, encryptedAttribute } = await encryptNFTAttributes(rarity, attribute);

      if (!encryptedRarity?.ctHash || !encryptedAttribute?.ctHash) {
        throw new Error("Encryption returned empty values.");
      }

      setStatusMessage("Submitting mint transaction...");

      const mintValue = parseEther(String(MINT_PRICE ?? "0"));

      const tokenUri = `ipfs://${metadataHash}`;

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "mint",
        args: [encryptedRarity, encryptedAttribute, tokenUri],
        value: mintValue,
      });

      console.log("Mint transaction submitted. Metadata hash:", metadataHash);
    } catch (err) {
      console.error("Minting failed:", err);
      setStatusType("error");
      setStatusMessage(err instanceof Error ? err.message : "Minting failed. Please try again.");
    } finally {
      setIsUploading(false);
      setIsEncrypting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-sm mx-auto bg-[#0f1220] border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-6 h-6 text-fuchsia-300" />
            Mint FIXN OG NFT
          </CardTitle>
          <CardDescription className="text-white/60">
            Create a privacy-preserving NFT with encrypted attributes on Sepolia.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {!isConnected && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Connect your wallet to mint NFTs.
            </div>
          )}

          {(statusMessage || isError) && (
            <div
              className={[
                "rounded-xl border p-4 text-sm",
                statusType === "error" ? "border-red-400/40 bg-red-500/10 text-red-200" : "",
                statusType === "success" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "",
                statusType === "info" ? "border-white/10 bg-white/5 text-white/70" : "",
              ].join(" ")}
            >
              <div className="flex items-start gap-2">
                {statusType === "success" ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-300" />
                ) : statusType === "error" ? (
                  <AlertCircle className="w-4 h-4 mt-0.5 text-red-300" />
                ) : (
                  <Sparkles className="w-4 h-4 mt-0.5 text-fuchsia-300" />
                )}
                <span>{statusMessage || (error instanceof Error ? error.message : "Transaction failed")}</span>
              </div>
            </div>
          )}

          {isConnected && (
            <>
              {mintSuccess && (
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  Mint submitted. Check your wallet for confirmations.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="image" className="text-white/80">NFT Image *</Label>
                <div className="flex flex-col items-center gap-2">
                  {imagePreview ? (
                    <div className="relative w-full aspect-square max-w-[220px] rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        x
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-fuchsia-300 mb-2" />
                        <p className="text-sm text-white/70">Click to upload image</p>
                        <p className="text-xs text-white/40 mt-1">Max 5MB</p>
                      </div>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">NFT Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter NFT name"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  className="bg-black/30 border-white/15 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/80">Description (Optional)</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-black/30 border-white/15 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rarity" className="text-white/80">Rarity Score (1-100)</Label>
                <Input
                  id="rarity"
                  type="number"
                  min="1"
                  max="100"
                  value={rarity}
                  onChange={(e) => setRarity(Number(e.target.value) || 0)}
                  className="bg-black/30 border-white/15 text-white placeholder:text-white/50"
                />
                <p className="text-xs text-white/50">
                  This value will be encrypted on-chain using FHE.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attribute" className="text-white/80">Special Attribute</Label>
                <Input
                  id="attribute"
                  type="number"
                  value={attribute}
                  onChange={(e) => setAttribute(Number(e.target.value) || 0)}
                  className="bg-black/30 border-white/15 text-white placeholder:text-white/50"
                />
                <p className="text-xs text-white/50">
                  Only you can decrypt this value.
                </p>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleMint}
            disabled={!isConnected || isPending || isUploading || isEncrypting}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-sky-500 hover:from-fuchsia-400 hover:to-sky-400 disabled:opacity-50 text-black font-semibold"
          >
            {isUploading || isEncrypting || isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading to IPFS..." : isEncrypting ? "Encrypting with CoFHE..." : "Minting..."}
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Mint NFT ({MINT_PRICE} ETH)
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
