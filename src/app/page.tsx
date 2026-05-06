"use client";

import { Hero } from "@/components/magic-ui/Hero";
import { ExpandingSearchDock } from "@/components/magic-ui/ExpandingSearchDock";
import { Button } from "@/components/ui/button";
import { FaPlay, FaGem, FaStar, FaShieldAlt, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cobalt/5 blur-[120px] rounded-full" />
      </div>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black group-hover:rotate-12 transition-transform shadow-shadow-glow">
              A
            </div>
            <span className="uppercase font-heading">AETHER <span className="text-primary">ELITE</span></span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8 sub-heading">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Membership</Link>
            <Link href="/boardroom" className="hover:text-primary transition-colors">Boardroom</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ExpandingSearchDock className="hidden sm:flex bg-white/5 border-border text-white placeholder:text-stone-500" />
          <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />
          <Link href="/auth/login">
            <Button variant="ghost" className="text-foreground hover:text-primary font-black text-[10px] uppercase tracking-widest px-6">Login</Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="btn-aether text-[10px] uppercase tracking-widest px-8 py-6">Apply Now</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 overflow-hidden">
        <Hero />
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-10 border-y border-border bg-white/[0.01]">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Elite Members", val: "10K+" },
            { label: "Success Rate", val: "94%" },
            { label: "Boardrooms", val: "500+" },
            { label: "Avg Net Worth", val: "$2.4M" },
          ].map((s, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="text-3xl font-black text-primary mb-1">{s.val}</div>
              <div className="sub-heading">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-24 text-center mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="sub-heading text-primary mb-6">
                Redefining Exclusivity
              </h2>
              <h3 className="text-4xl md:text-6xl font-heading leading-tight">
                Where high-net-worth meets <span className="text-stone-500 italic">absolute connection.</span>
              </h3>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <FaGem />,
                title: "Curated Network",
                desc: "Manual verification for every member. Connect with founders, creators, and high-performers who share your ambition."
              },
              {
                icon: <FaShieldAlt />,
                title: "Maximum Privacy",
                desc: "Sophisticated incognito modes and facial recognition verification ensure your digital footprint remains yours."
              },
              {
                icon: <FaStar />,
                title: "The Boardroom",
                desc: "Exclusive audio stages for live networking. Pitch, learn, and close deals in our members-only virtual rooms."
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="surface-card group p-10"
              >
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-2xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-shadow-glow text-primary">
                  {f.icon}
                </div>
                <h4 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors">{f.title}</h4>
                <p className="text-stone-500 leading-relaxed font-medium text-lg">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
            {[
              {
                icon: <FaPlay />,
                title: "Aether Reels",
                desc: "Experience elite moments through high-fidelity vertical video. Share your lifestyle and discover the circle in motion."
              },
              {
                icon: <FaGem />,
                title: "Elite Connections",
                desc: "Our proprietary matching algorithm prioritizes compatibility and shared ambition, fostering meaningful elite circles."
              }
            ].map((f, i) => (
              <motion.div 
                key={i + 3}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 3) * 0.1 }}
                viewport={{ once: true }}
                className="surface-card group p-10 flex flex-col md:flex-row gap-8 items-start md:items-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-shadow-glow text-primary shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h4 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">{f.title}</h4>
                  <p className="text-stone-500 leading-relaxed font-medium text-lg">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-6xl rounded-[3rem] bg-primary p-12 md:p-24 text-black overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-[40%] h-full opacity-10 pointer-events-none">
            <FaStar className="w-full h-full scale-150 rotate-12" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-4xl md:text-6xl font-heading mb-8 leading-none">
              READY TO JOIN THE <span className="underline decoration-stone-950/20">ELITE?</span>
            </h3>
            <p className="text-lg md:text-xl font-bold mb-10 opacity-80 max-w-lg">
              Membership is strictly limited. Apply now to secure your spot in the world&apos;s most exclusive social circle.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-black text-white px-10 py-8 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 transition-transform">
                Apply for Membership
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32 bg-background">
        <div className="container mx-auto px-6 text-center mb-24">
          <h2 className="sub-heading text-primary mb-6">Subscription</h2>
          <h3 className="text-4xl md:text-6xl font-heading mb-4">Investment in <span className="text-stone-500">Self.</span></h3>
        </div>

        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl">
          {[
            {
              name: "Standard",
              price: "Free",
              features: ["Daily Discover", "Basic Chat", "Boardroom Access"],
              button: "Get Started",
              popular: false
            },
            {
              name: "Signature",
              price: "$29",
              features: ["Unlimited Swipes", "5 Roses/Day", "Priority Profile", "Read Receipts"],
              button: "Go Signature",
              popular: true
            },
            {
              name: "Elite",
              price: "$99",
              features: ["Global Reach", "Unlimited Roses", "Incognito Mode", "Private Boardrooms", "VIP Events"],
              button: "Join the Elite",
              popular: false
            }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`surface-card relative p-10 flex flex-col group ${plan.popular ? 'border-primary shadow-shadow-glow' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              <h4 className="text-xl font-black mb-1 group-hover:text-primary transition-colors">{plan.name}</h4>
              <div className="flex items-baseline gap-1 mb-10">
                <span className="text-5xl font-black">{plan.price}</span>
                {plan.price !== "Free" && <span className="text-stone-500 font-bold text-sm">/month</span>}
              </div>
              
              <ul className="space-y-6 mb-12 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-4 text-sm font-bold text-stone-400">
                    <FaChevronRight className="w-3 h-3 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full py-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  plan.popular 
                    ? 'bg-primary text-black hover:bg-primary/90 shadow-xl shadow-primary/20' 
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {plan.button}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-background pt-32 pb-12">
        <div className="container mx-auto px-6 border-b border-border pb-24 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-2">
            <div className="text-3xl font-black tracking-tighter mb-8 font-heading">
              AETHER <span className="text-primary">ELITE</span>
            </div>
            <p className="text-stone-500 max-w-sm font-bold text-lg leading-relaxed">
              The world&apos;s most exclusive social circle for those who refuse to settle.
              Join the circle and experience networking at its peak.
            </p>
          </div>
          <div>
            <h5 className="sub-heading mb-8 text-primary">Explore</h5>
            <ul className="space-y-5 text-sm font-black text-stone-500 uppercase tracking-widest">
              <li><Link href="/discover" className="hover:text-white transition-colors">Discover</Link></li>
              <li><Link href="/boardroom" className="hover:text-white transition-colors">Boardroom</Link></li>
              <li><Link href="/chat" className="hover:text-white transition-colors">Messages</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="sub-heading mb-8 text-primary">Contact</h5>
            <ul className="space-y-5 text-sm font-black text-stone-500 uppercase tracking-widest">
              <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Concierge</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="sub-heading text-stone-600">
            © 2026 Aether Elite. Cyber-Organic Luxury.
          </div>
          <div className="flex gap-8 sub-heading text-stone-600">
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

