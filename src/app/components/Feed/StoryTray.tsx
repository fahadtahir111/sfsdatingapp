/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCamera } from "react-icons/fa";
import { useAuth } from "@/app/providers/AuthProvider";
import Image from "next/image";
import { CldImage } from 'next-cloudinary';


interface StoryGroup {
  userId: string;
  userName: string;
  userImage: string;
  stories: {
    id: string;
    mediaUrl: string;
    mediaType: string;
    createdAt: string;
  }[];
}

interface StoryTrayProps {
  stories: StoryGroup[];
  onAddStory: () => void;
}

export default function StoryTray({ stories, onAddStory }: StoryTrayProps) {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<StoryGroup | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const openStories = (group: StoryGroup) => {
    setSelectedGroup(group);
    setCurrentStoryIndex(0);
  };

  const nextStory = useCallback(() => {
    if (!selectedGroup) return;
    if (currentStoryIndex < selectedGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      setSelectedGroup(null);
    }
  }, [selectedGroup, currentStoryIndex]);

  const prevStory = () => {
    if (!selectedGroup) return;
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  // Auto-progress stories
  useEffect(() => {
    if (!selectedGroup) return;
    const timer = setTimeout(() => {
      nextStory();
    }, 5000);
    return () => clearTimeout(timer);
  }, [selectedGroup, currentStoryIndex, nextStory]);

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
        {/* My Story / Add Button */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <button 
            onClick={onAddStory}
            className="relative w-16 h-16 rounded-full border-2 border-stone-200 p-1 flex items-center justify-center hover:border-yellow-400 transition-colors"
          >
            <div className="w-full h-full rounded-full bg-stone-100 overflow-hidden relative">
              <img 
                src={user?.image || `https://ui-avatars.com/api/?name=${user?.name || 'Me'}`} 
                alt="Me" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <FaCamera className="text-[10px] text-yellow-950" />
                </div>
              </div>
            </div>
          </button>
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">My Story</span>
        </div>

        {/* Friends Stories */}
        {stories.map((group) => (
          <div key={group.userId} className="flex flex-col items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => openStories(group)}
              className="w-16 h-16 rounded-full border-2 border-yellow-400 p-1 flex items-center justify-center active:scale-95 transition-transform"
            >
              <div className="w-full h-full rounded-full overflow-hidden border border-white">
                {group.userImage.includes('cloudinary') ? (
                  <CldImage 
                    src={group.userImage} 
                    alt={group.userName} 
                    width={64} 
                    height={64} 
                    className="w-full h-full object-cover"
                    crop="thumb"
                    gravity="face"
                  />
                ) : (
                  <Image 
                    src={group.userImage} 
                    alt={group.userName} 
                    width={64} 
                    height={64} 
                    className="w-full h-full object-cover"
                  />
                )}

              </div>
            </button>
            <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest truncate w-16 text-center">
              {group.userName.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-[110]">
              {selectedGroup.stories.map((_, idx) => (
                <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: idx === currentStoryIndex ? "100%" : idx < currentStoryIndex ? "100%" : "0%" 
                    }}
                    transition={{ 
                      duration: idx === currentStoryIndex ? 5 : 0,
                      ease: "linear"
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-10 left-4 right-4 flex items-center justify-between z-[110]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                  <img src={selectedGroup.userImage} alt={selectedGroup.userName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white text-sm font-black tracking-tight">{selectedGroup.userName}</p>
                  <p className="text-white/60 text-[10px] font-bold uppercase">
                    {new Date(selectedGroup.stories[currentStoryIndex].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedGroup(null)}
                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedGroup.stories[currentStoryIndex].mediaType === "video" ? (
                <video 
                  src={selectedGroup.stories[currentStoryIndex].mediaUrl} 
                  className="w-full h-full object-contain" 
                  autoPlay 
                  playsInline
                />
              ) : (
                selectedGroup.stories[currentStoryIndex].mediaUrl.includes('cloudinary') ? (
                  <CldImage 
                    src={selectedGroup.stories[currentStoryIndex].mediaUrl} 
                    className="w-full h-full object-contain" 
                    alt="Story"
                    width={1080}
                    height={1920}
                  />
                ) : (
                  <img 
                    src={selectedGroup.stories[currentStoryIndex].mediaUrl} 
                    className="w-full h-full object-contain" 
                    alt="Story"
                  />
                )
              )}


              {/* Navigation Zones */}
              <div className="absolute inset-0 flex">
                <div className="w-1/3 h-full cursor-pointer" onClick={prevStory} />
                <div className="w-2/3 h-full cursor-pointer" onClick={nextStory} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
