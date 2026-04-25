"use client";

import { motion } from "framer-motion";
import { FaUserCircle, FaVideo, FaCommentDots, FaPlay } from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BgElement {
  initial: { x: number; y: number; scale: number };
  animate: { x: number[]; y: number[] };
  duration: number;
  style: { width: string; height: string; left: string; top: string };
}

export default function Main() {
  const [isMounted, setIsMounted] = useState(false);
  const [bgElements, setBgElements] = useState<BgElement[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const count = window.innerWidth < 640 ? 3 : 5;
    const elements = [...Array(count)].map(() => ({
      initial: {
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        scale: Math.random() * 0.5 + 0.5
      },
      animate: {
        x: [0, (Math.random() - 0.5) * 100],
        y: [0, (Math.random() - 0.5) * 100],
      },
      duration: Math.random() * 20 + 20,
      style: {
        width: `${Math.random() * 400 + 100}px`,
        height: `${Math.random() * 400 + 100}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }
    }));
    setBgElements(elements);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-secondary overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isMounted && bgElements.map((el, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-60 blur-[100px] bg-gradient-to-r from-primary to-accent"
            initial={el.initial}
            animate={{
              x: el.animate.x,
              y: el.animate.y,
              transition: {
                duration: el.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }
            }}
            style={el.style}
          />
        ))}
      </div>

      {/* Navigation - responsive padding and button sizes */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm py-4"
      >
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl font-black tracking-tighter text-foreground"
          >
            SFS <span className="text-primary">Elite</span>
          </motion.div>
          <div className="flex gap-2 sm:gap-4">
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base font-semibold border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Log In
              </motion.button>
            </Link>
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base rounded-full bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-primary/50 transition-all duration-300"
              >
                Apply Now
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - responsive text sizes and spacing */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-24 sm:pt-28 pb-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="inline-block mb-4 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-foreground font-medium text-sm sm:text-base backdrop-blur-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              ✨ The New Era of Exclusive Dating
            </motion.div>
            
            <motion.h1 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 text-foreground tracking-tight leading-[1.1]"
            >
              Curated Connections,<br />
              <span className="text-primary">Elevated Experiences.</span>
            </motion.h1>
            
            <motion.p
              className="text-lg sm:text-xl md:text-2xl mb-10 text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Discover elite professionals through high-quality Reels, authentic Stories, and real-time private Chats.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12 sm:mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg rounded-full bg-primary text-primary-foreground font-black shadow-xl hover:shadow-primary/40 transition-all duration-300"
                >
                  Join the Waitlist
                </motion.button>
              </Link>
              
              <Link href="/discover">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg border-2 border-border bg-white/50 backdrop-blur-md text-foreground font-bold rounded-full hover:bg-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaPlay className="text-sm" /> Explore Feed
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <FeatureCard 
              icon={<FaUserCircle className="text-3xl sm:text-4xl text-primary" />} 
              title="Exclusive Profiles" 
              description="Verified executives and high-value individuals." 
            />
            <FeatureCard 
              icon={<FaVideo className="text-3xl sm:text-4xl text-primary" />} 
              title="Stories & Reels" 
              description="Get authentic glimpses into matches' daily lives." 
            />
            <FeatureCard 
              icon={<FaCommentDots className="text-3xl sm:text-4xl text-primary" />} 
              title="Real-Time Chat" 
              description="End-to-end lightning fast messaging experience." 
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-6 sm:p-8 rounded-3xl bg-white/60 backdrop-blur-lg border border-white/50 shadow-xl shadow-black/[0.03] hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 mb-6 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center border border-primary/20">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground tracking-tight">{title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground font-medium">{description}</p>
    </motion.div>
  );
};
