"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const colors = [
    "#FF0080", // Pink
    "#FF8C00", // Orange
    "#FFD700", // Gold
    "#00FF00", // Green
    "#00CED1", // Cyan
    "#1E90FF", // Blue
    "#9370DB", // Purple
    "#FF1493", // Deep Pink
];

const finalText = "FIXN OG";

export function AnimatedTitle() {
    const [currentText, setCurrentText] = useState("");
    const [colorIndex, setColorIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);
    const [showFinal, setShowFinal] = useState(false);

    // Random characters for animation
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

    useEffect(() => {
        if (!isAnimating) return;

        const interval = setInterval(() => {
            // Generate random text
            const randomText = Array(7)
                .fill(0)
                .map(() => chars[Math.floor(Math.random() * chars.length)])
                .join("");

            setCurrentText(randomText);
            setColorIndex((prev) => (prev + 1) % colors.length);
        }, 100);

        // Stop animation after 3 seconds and show final text
        const timeout = setTimeout(() => {
            clearInterval(interval);
            setIsAnimating(false);
            setShowFinal(true);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [isAnimating]);

    return (
        <div className="flex items-center justify-center min-h-[120px]">
            <AnimatePresence mode="wait">
                {showFinal ? (
                    <motion.h1
                        key="final"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        transition={{
                            duration: 0.8,
                        }}
                        className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"
                        style={{
                            textShadow: "0 0 30px rgba(255, 0, 128, 0.5)",
                        }}
                    >
                        {finalText}
                    </motion.h1>
                ) : (
                    <motion.h1
                        key="animating"
                        className="text-6xl md:text-8xl font-black"
                        style={{ color: colors[colorIndex] }}
                        animate={{
                            textShadow: [
                                `0 0 20px ${colors[colorIndex]}80`,
                                `0 0 40px ${colors[colorIndex]}60`,
                                `0 0 20px ${colors[colorIndex]}80`,
                            ],
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    >
                        {currentText}
                    </motion.h1>
                )}
            </AnimatePresence>
        </div>
    );
}
