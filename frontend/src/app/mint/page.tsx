"use client";

import { Header } from "@/components/layout/Header";
import { MintCard } from "@/components/mint/MintCard";
import { motion } from "framer-motion";
import { Sparkles, Shield, Lock, Cpu } from "lucide-react";

export default function MintPage() {
  return (
    <main className="min-h-screen bg-[#0b0b12] text-white">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
            <Sparkles className="h-4 w-4" />
            Mint Portal
          </div>
          <h2 className="display-font text-3xl md:text-4xl font-semibold mt-4">
            Mint Your Private NFT
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto mt-3">
            Upload your art, encrypt the traits, and mint on Sepolia with CoFHE. Only the owner can decrypt the private values.
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <MintCard />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="curve-glow rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Mint checklist</h3>
              <ul className="mt-3 space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-3"><Shield className="h-4 w-4 text-fuchsia-300 mt-0.5" />Connect wallet on Sepolia</li>
                <li className="flex items-start gap-3"><Lock className="h-4 w-4 text-sky-300 mt-0.5" />Encrypt rarity and traits</li>
                <li className="flex items-start gap-3"><Cpu className="h-4 w-4 text-emerald-300 mt-0.5" />Mint with CoFHE inputs</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <h4 className="text-sm uppercase tracking-[0.3em] text-white/60">Security</h4>
              <p className="mt-3 text-sm text-white/70">
                Attributes are encrypted client-side and never exposed publicly. Decryption requires your PermissionedV2 permit.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
