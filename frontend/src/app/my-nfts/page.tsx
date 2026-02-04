"use client";

import { Header } from "@/components/layout/Header";
import { NFTGallery } from "@/components/nft/NFTGallery";
import { motion } from "framer-motion";

export default function MyNFTsPage() {
  return (
    <main className="min-h-screen bg-[#0b0b12] text-white">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="display-font text-3xl md:text-4xl font-semibold mb-3">
            My NFTs
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            View NFTs owned by your connected wallet and decrypt private attributes on demand.
          </p>
        </motion.div>

        <NFTGallery initialMode="owned" showModeToggle={false} />
      </div>
    </main>
  );
}
