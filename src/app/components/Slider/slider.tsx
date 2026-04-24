'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FaCheck } from 'react-icons/fa';
import Image from 'next/image';

const LoveStories = () => {
  const stories = [
    {
      id: 1,
      image: '/assets/couple1.png',
      names: 'Sarah & Michael',
      description: 'Met in 2022, now engaged!',
      width: 1024,
      height: 764,
    },
    {
      id: 2,
      image: '/assets/couple2.png',
      names: 'James & Emma',
      description: 'Connected across continents',
      width: 1024,
      height: 1100,
    },
    {
      id: 3,
      image: '/assets/couple3.png',
      names: 'David & Priya',
      description: "Our algorithm's perfect match",
      width: 1024,
      height: 771,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <motion.div 
          className="grid md:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div>
            <motion.h1 
              className="text-5xl lg:text-6xl font-black mb-6 text-foreground tracking-tight"
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Real <span className="text-primary bg-clip-text">Connections</span>
            </motion.h1>
            <motion.p 
              className="text-muted-foreground font-medium mb-8 text-lg"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              Discover how real people found love on LoveConnect Pro. These journeys showcase the magic of smart matchmaking and real connections.
            </motion.p>
            <motion.ul 
              className="space-y-3 text-gray-600"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4, staggerChildren: 0.1 }}
              viewport={{ once: true }}
            >
              {['Millions of success stories', 'Couples from every continent', 'Trusted by genuine singles worldwide'].map((item, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start"
                  initial={{ x: -20 }}
                  whileInView={{ x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <FaCheck className="text-primary mt-1 mr-3 flex-shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <motion.div 
            className="w-full overflow-hidden rounded-xl shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              navigation={true}
              className="swiper-container"
            >
              {stories.map((story) => (
                <SwiperSlide key={story.id}>
                  <div className="relative group">
                    <Image 
                      src={story.image} 
                      alt={`Love Story ${story.id}`}
                      width={story.width}
                      height={story.height}
                      className="w-full h-64 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                      <motion.h3 
                        className="text-white text-2xl font-semibold mb-1"
                        initial={{ y: 20 }}
                        whileInView={{ y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {story.names}
                      </motion.h3>
                      <motion.p 
                        className="text-gray-300"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {story.description}
                      </motion.p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </motion.div>
      </div>

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          background: rgba(0,0,0,0.3);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(0,0,0,0.5);
        }
        
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 20px;
          font-weight: bold;
        }
        
        .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 10px;
          height: 10px;
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet-active {
          background: var(--primary);
          opacity: 1;
          width: 20px;
          border-radius: 5px;
        }
      `}</style>
    </section>
  );
};

export default LoveStories;
