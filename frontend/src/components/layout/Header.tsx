"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import Link from "next/link";

export function Header() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 w-full py-5 px-6 md:px-12 lg:px-16"
        >
            <div className="max-w-[1440px] mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="group">
                            <span className="text-xl md:text-2xl font-semibold tracking-tight text-white">
                                FIXN OG
                            </span>
                            <span className="ml-2 text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">
                                CoFHE
                            </span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-4 text-sm text-white/60">
                            <Link href="/mint" className="hover:text-white transition-colors">Mint</Link>
                            <Link href="/my-nfts" className="hover:text-white transition-colors">My NFTs</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <ConnectButton.Custom>
                            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                                const connected = mounted && account && chain;
                                if (!connected) {
                                    return (
                                        <button
                                            onClick={openConnectModal}
                                            type="button"
                                            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-4 py-2 text-xs font-semibold text-black shadow-[0_0_24px_rgba(236,72,153,0.4)] hover:from-fuchsia-400 hover:to-sky-400 transition"
                                        >
                                            Connect Wallet
                                        </button>
                                    );
                                }

                                return (
                                    <button
                                        onClick={openAccountModal}
                                        type="button"
                                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 hover:text-white hover:border-white/30 transition"
                                    >
                                        {account.displayName}
                                    </button>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
