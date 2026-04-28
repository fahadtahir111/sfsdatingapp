"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaCrown, FaHeart, FaComment, FaShare } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { CldImage } from 'next-cloudinary';
import { useToast } from "@/app/providers/ToastProvider";

import { formatRelativeTime } from "@/lib/utils/format";

interface PostCardProps {
  post: {
    id: string;
    type: string; // "POST" | "REEL"
    content: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    createdAt: string | Date;
    user: {
      id: string;
      name: string | null;
      image: string;
      tier: string;
    };
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
  };
  onLike: (id: string, type: string) => void;
  onDelete?: (id: string, type: string) => void;
  canDelete?: boolean;
  index?: number;
}

export default function PostCard({ post, onLike, onDelete, canDelete = false, index = 0 }: PostCardProps) {
  const { showToast } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteConfirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // If the URL is a Cloudinary URL, ensure it uses auto quality and format
  const optimizedVideoUrl = post.mediaType === "VIDEO" && post.mediaUrl?.includes('cloudinary.com') 
    ? post.mediaUrl.replace('/upload/', '/upload/f_auto,q_auto/') 
    : post.mediaUrl;

  useEffect(() => {
    return () => {
      if (deleteConfirmTimeout.current) {
        clearTimeout(deleteConfirmTimeout.current);
      }
    };
  }, []);

  return (
    <motion.div 

      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-stone-100"
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.user.id}`} className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden border border-stone-100 relative block flex-shrink-0">
            <Image 
              src={post.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name || 'User')}`} 
              alt={post.user.name || "User"} 
              fill
              className="object-cover"
            />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Link href={`/profile/${post.user.id}`} className="hover:underline">
                <p className="text-sm font-black text-stone-900">{post.user.name || "Anonymous"}</p>
              </Link>
              {post.user.tier === "Elite" && (
                <FaCrown className="text-[10px] text-yellow-500" />
              )}
            </div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
        {canDelete ? (
          <button
            type="button"
            onClick={() => {
              if (!confirmingDelete) {
                setConfirmingDelete(true);
                if (deleteConfirmTimeout.current) clearTimeout(deleteConfirmTimeout.current);
                deleteConfirmTimeout.current = setTimeout(() => setConfirmingDelete(false), 2200);
                return;
              }
              setConfirmingDelete(false);
              if (deleteConfirmTimeout.current) clearTimeout(deleteConfirmTimeout.current);
              onDelete?.(post.id, post.type);
            }}
            className={`text-xs font-black uppercase tracking-wider transition-colors ${
              confirmingDelete ? "text-red-700" : "text-red-500 hover:text-red-600"
            }`}
          >
            {confirmingDelete ? "Confirm?" : "Delete"}
          </button>
        ) : (
          <button type="button" className="text-stone-300" aria-label="Post menu">•••</button>
        )}
      </div>

      <div className="px-6 pb-4">
        <p className="text-sm text-stone-800 leading-relaxed font-medium whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {post.mediaUrl && (
        <div className="px-4 pb-4">
          {post.mediaType === "VIDEO" ? (
            <video 
              src={optimizedVideoUrl || undefined} 
              className="w-full h-80 object-cover rounded-[2rem]" 
              controls
              playsInline
            />
          ) : (


            <div className="relative w-full h-80 rounded-[2rem] overflow-hidden">
              {post.mediaUrl?.includes('cloudinary') ? (
                <CldImage 
                  src={post.mediaUrl} 
                  alt="Post content" 
                  fill
                  className="object-cover"
                  crop="fill"
                  gravity="auto"
                />
              ) : (
                <Image 
                  src={post.mediaUrl || ""} 
                  alt="Post content" 
                  fill
                  className="object-cover"
                />
              )}
            </div>
          )}

        </div>
      )}

      <div className="px-6 py-4 flex items-center gap-6 border-t border-stone-50">
        <button 
          onClick={() => onLike(post.id, post.type)}
          className={`flex items-center gap-2 text-xs font-black transition-colors ${post.isLiked ? 'text-primary' : 'text-stone-400 hover:text-stone-900'}`}
        >
          <FaHeart className={post.isLiked ? "scale-110" : ""} />
          {post.likesCount}
        </button>
        <button className="flex items-center gap-2 text-xs font-black text-stone-400 hover:text-stone-900 transition-colors">
          <FaComment />
          {post.commentsCount}
        </button>
        <button 
          onClick={() => {
            const shareData = {
              title: 'SFS Elite Post',
              text: post.content,
              url: window.location.origin + '/feed/' + post.id,
            };
            if (navigator.share) {
              navigator.share(shareData).catch(console.error);
            } else {
              navigator.clipboard.writeText(shareData.url);
              showToast("Link copied to clipboard", "success");
            }
          }}
          className="flex items-center gap-2 text-xs font-black text-stone-400 hover:text-stone-900 transition-colors ml-auto"
        >
          <FaShare />
        </button>
      </div>
    </motion.div>
  );
}
