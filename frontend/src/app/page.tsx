"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Eye, Sparkles, Layers, Cpu } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AnimatedTitle } from "@/components/layout/AnimatedTitle";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay },
  }),
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0b12] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,#7c3aed_0%,rgba(124,58,237,0.15)_45%,transparent_70%)] blur-2xl" />
          <div className="absolute top-40 -right-32 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,#22d3ee_0%,rgba(34,211,238,0.12)_45%,transparent_70%)] blur-2xl" />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-[48%] bg-[radial-gradient(circle,#f472b6_0%,rgba(244,114,182,0.12)_40%,transparent_70%)] blur-3xl" />
        </div>

        <Header />

        <section className="relative z-10 mx-auto max-w-6xl px-6 pt-6 pb-16 md:pt-14">
          <motion.div
            initial="hidden"
            animate="show"
            className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center"
          >
            <div className="space-y-8">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
                <Sparkles className="h-4 w-4" />
                Private NFTs on Sepolia
              </motion.div>

              <motion.div variants={fadeUp} custom={0.1}>
                <AnimatedTitle />
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={0.2}
                className="display-font text-3xl md:text-5xl font-semibold leading-tight"
              >
                Confidential Minting Suite
                <span className="block bg-gradient-to-r from-fuchsia-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
                  Powered by CoFHE
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.35}
                className="text-base md:text-lg text-white/70 max-w-xl"
              >
                Mint NFTs with encrypted attributes using Fhenix CoFHE. Your rarity, traits, and mint stats stay private on-chain while remaining verifiable.
              </motion.p>

              <motion.div variants={fadeUp} custom={0.5} className="flex flex-wrap items-center gap-4">
                <Link href="/mint" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-semibold hover:bg-white/90 transition">
                  Start Minting
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/my-nfts" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
                  My NFTs
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={0.65} className="flex items-center gap-4 text-sm text-white/60">
                <span className="inline-flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  CoFHE Coprocessor
                </span>
                <span className="inline-flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Encrypted Metadata
                </span>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} custom={0.3} className="relative">
              <div className="curve-glow rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Encrypted Traits</p>
                    <p className="mt-3 text-2xl font-semibold">Rarity: ####</p>
                    <p className="text-sm text-white/60">Attribute: #######</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Permit Access</p>
                    <p className="mt-3 text-lg">Owner-only decryption with PermissionedV2</p>
                  </div>
                  <a
                    href="https://x.com/0xmirx"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-xs font-semibold tracking-[0.4em] uppercase neon-mir"
                  >
                    Architect by MIR
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 md:grid-cols-3"
        >
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-fuchsia-300" />}
            title="Encrypted Attributes"
            description="Rarity and traits live on-chain as encrypted values. Only you can decrypt them."
            delay={0}
          />
          <FeatureCard
            icon={<Lock className="h-6 w-6 text-sky-300" />}
            title="Private Mint Stats"
            description="Total supply and user mint counts are hidden using FHE arithmetic."
            delay={0.15}
          />
          <FeatureCard
            icon={<Eye className="h-6 w-6 text-emerald-300" />}
            title="Selective Disclosure"
            description="Grant access through PermissionedV2 permits without exposing raw data."
            delay={0.3}
          />
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="curve-glow rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 md:p-12"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">How it works</p>
            <h2 className="display-font mt-3 text-3xl md:text-4xl font-semibold">A clear, private mint flow</h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
            <StepCard number="01" title="Connect + Permit" description="Connect your wallet and sign a CoFHE permit. This grants you sealed access to your private data." delay={0.05} />
            <StepCard number="02" title="Encrypt + Mint" description="Attributes are encrypted client-side and submitted as verified FHE inputs." delay={0.15} />
            <StepCard number="03" title="Decrypt on Demand" description="Request decrypt when needed. Only the owner can reveal the sealed results." delay={0.25} />
            <StepCard number="04" title="Trade Confidently" description="Metadata remains private while NFTs stay fully tradable across the ecosystem." delay={0.35} />
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-[32px] bg-gradient-to-r from-fuchsia-500/20 via-purple-500/30 to-sky-500/20 border border-white/10 p-10 text-center"
        >
          <h3 className="display-font text-2xl md:text-3xl font-semibold">Ready to mint your first private NFT?</h3>
          <p className="mt-3 text-white/70">
            Join the next wave of privacy-preserving digital assets on Sepolia.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/mint" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-semibold hover:bg-white/90 transition">
              Mint Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://x.com/0xmirx"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Follow @0xmirx
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/50">
        <p>FIXN OG - Privacy-preserving NFT platform</p>
        <a
          href="https://x.com/0xmirx"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center justify-center neon-mir"
        >
          Architect by MIR
        </a>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{description}</p>
    </motion.div>
  );
}

function StepCard({
  number,
  title,
  description,
  delay,
}: {
  number: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div variants={fadeUp} custom={delay} className="rounded-2xl border border-white/10 bg-black/20 p-6">
      <div className="flex items-center gap-3">
        <span className="display-font text-2xl text-white/80">{number}</span>
        <h4 className="text-lg font-semibold">{title}</h4>
      </div>
      <p className="mt-3 text-sm text-white/70">{description}</p>
    </motion.div>
  );
}
