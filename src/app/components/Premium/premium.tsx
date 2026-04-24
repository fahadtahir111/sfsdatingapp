'use client';

import { FaRegPlayCircle, FaCommentDots, FaShieldAlt, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const FeatureCard = ({ 
  icon, 
  title, 
  desc,
  delay 
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-border"
    >
      <div className="w-16 h-16 mb-6 rounded-lg bg-gradient-to-r from-primary/20 to-accent/30 flex items-center justify-center text-3xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground font-medium">{desc}</p>
      <div className="mt-8">
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full" 
            style={{ width: inView ? '100%' : '0%', transition: 'width 1s ease-in-out', transitionDelay: `${delay + 0.3}s` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const PremiumFeatures = () => {
  const features = [
    {
      icon: <FaStar className="text-primary" />,
      title: "Algorithmic Matching",
      desc: "Curated daily selections of high-value singles matching your exacting standards.",
    },
    {
      icon: <FaRegPlayCircle className="text-primary" />,
      title: "Exclusive Reels",
      desc: "Upload short-form visual content to showcase your lifestyle authentically.",
    },
    {
      icon: <FaShieldAlt className="text-primary" />,
      title: "Strictly Verified",
      desc: "Mandatory verification process ensuring an elite and secure community.",
    },
    {
      icon: <FaCommentDots className="text-primary" />,
      title: "Priority Messaging",
      desc: "End-to-end lightning-fast chats with read receipts and priority placement.",
    },
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-secondary/30 to-white pointer-events-none" />
      <div className="container relative mx-auto px-6 max-w-7xl">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 text-sm font-bold tracking-wider uppercase rounded-full bg-primary/10 text-primary-foreground mb-4 border border-primary/20"
          >
            SFS EXCLUSIVE
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-center mb-6 text-foreground tracking-tight"
          >
            The Elite Experience
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto"
          >
            Elevate your journey with features engineered exclusively for those who demand the best.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              desc={feature.desc}
              delay={index * 0.15}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <button className="px-10 py-5 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-xl hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none">
            Unlock Full Access
            <span className="ml-2 inline-block">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumFeatures;
