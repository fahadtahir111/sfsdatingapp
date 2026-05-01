'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaCheck, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';

const PricingCard = ({ 
  plan, 
  price, 
  features, 
  highlight,
  delay 
}: {
  plan: string;
  price: string;
  features: string[];
  highlight?: boolean;
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
      className={`relative p-8 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border ${
        highlight 
          ? 'border-2 border-primary' 
          : 'border-border'
      }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
          Most Popular
        </div>
      )}
      
      <h3 className="text-2xl font-black mb-2 text-foreground">{plan}</h3>
      <div className="text-4xl font-black mb-6 text-foreground bg-clip-text">
        {price}
      </div>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-muted-foreground font-medium">
            <FaCheck className="text-primary mt-1 mr-3 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <button className={`w-full py-4 rounded-full font-bold transition-all duration-300 ${
        highlight
          ? 'bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/30'
          : 'bg-secondary text-secondary-foreground hover:bg-primary/20'
      }`}>
        {highlight ? "Apply for Signature" : "Begin Verification"}
      </button>
    </motion.div>
  );
};

const Footer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="py-16 border-t border-border bg-white"
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-2xl font-black text-foreground mb-4 tracking-tighter">
              SFS <span className="text-primary">Elite</span>
            </div>
            <p className="text-muted-foreground font-medium">
              The exclusive network for driven professionals seeking authentic and high-quality connections.
            </p>
          </motion.div>

          {[
            {
              title: "Discover",
              items: ["Stories", "Reels", "Elite Connections", "Verified Users"],
            },
            {
              title: "Support",
              items: ["Concierge", "Safety & Privacy", "Contact Us", "Terms & Conditions"],
            },
          ].map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <h4 className="text-lg font-bold mb-4 text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.items.map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className="text-lg font-bold mb-4 text-foreground">
              Follow us
            </h4>
            <div className="flex space-x-4">
              {[
                { icon: FaInstagram, color: "text-foreground" },
                { icon: FaTwitter, color: "text-foreground" },
                { icon: FaTiktok, color: "text-foreground" },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className={`text-2xl ${social.color} hover:text-primary transition-colors`}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16 pt-8 border-t border-border text-muted-foreground font-medium text-sm"
        >
          <p>&copy; {new Date().getFullYear()} SFS Elite Network. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

const PricingSection = () => {
  const pricingPlans = [
    {
      plan: "Guest Level",
      price: "Complimentary",
      features: ["5 elite connections daily", "View public stories", "Standard verification required", "Browse discover feed"],
    },
    {
      plan: "Signature Level",
      price: "$49/month",
      highlight: true,
      features: ["Unlimited elite connections", "Priority discovery ranking", "Real-time read receipts", "Post exclusive Reels", "Dedicated profile review"],
    },
    {
      plan: "Elite Concierge",
      price: "$199/month",
      features: ["Everything in Signature", "Personalized matchmaker", "Zero waiting time", "Private VIP events", "Incognito browsing"],
    },
  ];

  return (
    <section className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 text-sm font-bold tracking-wider uppercase rounded-full bg-primary/10 text-primary-foreground mb-4 border border-primary/20"
          >
            MEMBERSHIP TIERS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-black text-center mb-6 text-foreground tracking-tight"
          >
            Join the Network
          </motion.h2>
            SFS is an exclusive community. Choose the membership level that suits your networking approach.
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan.plan}
              price={plan.price}
              features={plan.features}
              highlight={plan.highlight}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { PricingSection, Footer };
