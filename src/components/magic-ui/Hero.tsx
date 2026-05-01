"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["elite", "exclusive", "powerful", "luxurious", "connected"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button variant="secondary" size="sm" className="gap-4 rounded-full border border-white/10 bg-white/5 text-primary hover:bg-white/10">
              Welcome to the 1% <MoveRight className="w-4 h-4" />
            </Button>
          </motion.div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-8xl max-w-5xl tracking-tighter text-center font-black text-white leading-[0.9]">
              <span className="text-stone-600">Networking should be</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-4 min-h-[1.2em]">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-black text-primary uppercase italic"
                    initial={{ opacity: 0, y: "100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>
            <p className="text-lg md:text-2xl leading-relaxed tracking-tight text-stone-500 max-w-3xl text-center font-bold mt-8">
              SFS Elite is the premier platform for high-net-worth individuals, 
              founders, and creators. Experience dating and networking with a 
              touch of absolute luxury.
            </p>
          </div>
          <div className="flex flex-row gap-4 mt-10">
            <Button size="lg" className="gap-4 rounded-2xl border-white/10 text-white bg-white/5 hover:bg-white/10 px-8 py-8 text-sm uppercase tracking-widest font-black transition-all" variant="outline">
              Explore Tiers <PhoneCall className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-4 rounded-2xl bg-primary hover:bg-yellow-300 text-black shadow-2xl shadow-primary/20 px-10 py-8 text-sm uppercase tracking-widest font-black transition-all hover:scale-105">
              Get Started <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };

