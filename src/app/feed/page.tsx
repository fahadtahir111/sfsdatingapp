"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaCamera, FaTimes, FaSmile, FaSearch } from "react-icons/fa";
import { useAuth } from "@/app/providers/AuthProvider";
import { fetchFeedPosts } from "./actions";
import { getStories, createStory } from "./storyActions";
import { toggleLike, createSocialContent } from "@/lib/actions/social";
import StoryTray from "../components/Feed/StoryTray";
import PostCard from "../components/Feed/PostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmojiPicker from "../components/EmojiPicker";
import { useToast } from "@/app/providers/ToastProvider";
import { deleteOwnContent } from "@/lib/actions/social";

interface FeedPost {
  id: string;
  type: string; // "POST" | "REEL"
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    image: string;
    tier: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

interface FeedStory {
  userId: string;
  userName: string;
  userImage: string;
  stories: Array<{
    id: string;
    mediaUrl: string;
    mediaType: string;
    createdAt: string;
  }>;
}

export default function FeedPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [stories, setStories] = useState<FeedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO" | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    const [postData, storyData] = await Promise.all([
      fetchFeedPosts(),
      getStories()
    ]);
    setPosts(postData);
    setStories(storyData);
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !mediaUrl) return;
    setIsPosting(true);
    try {
      const res = await createSocialContent(newPostContent, mediaUrl, mediaType || undefined);
      if (res.success) {
        setNewPostContent("");
        setMediaUrl("");
        setMediaType(null);
        showToast("Shared successfully", "success");
        loadFeed();
      } else {
        showToast("Failed to share: " + (res.error || "Unknown error"), "error");
      }
    } catch (err) {
      console.error("Post creation error:", err);
      showToast("An unexpected error occurred while sharing.", "error");
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddStory = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      
      // Client-side validations
      if (file.size > 20 * 1024 * 1024) {
        showToast("File too large. Max 20MB allowed.", "error");
        return;
      }

      const isVideo = file.type.startsWith("video");
      if (isVideo) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = async () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 60) {
            showToast("Video too long. Max 1 minute allowed.", "error");
            setUploadingMedia(false);
            return;
          }
          await performStoryUpload(file);
        };
        video.src = URL.createObjectURL(file);
      } else {
        await performStoryUpload(file);
      }
    };
    input.click();
  };

  const performStoryUpload = async (file: File) => {
    setUploadingMedia(true);
    try {
      const sigRes = await fetch("/api/upload/signature");
      const sigData = await sigRes.json();
      console.log("Story upload signature response:", sigData);
      if (!sigData.success) throw new Error(sigData.error || "Failed to get upload signature");

      console.log("Story uploading to Cloudinary cloud:", sigData.cloudName);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp);
      formData.append("signature", sigData.signature);
      formData.append("folder", sigData.folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");

      const type = file.type.startsWith("video") ? "VIDEO" : "IMAGE";
      await createStory(data.secure_url, type);
      showToast("Story uploaded", "success");
      loadFeed();
    } catch (err) {
      console.error("Story upload failed", err);
      showToast("Story upload failed: " + (err instanceof Error ? err.message : "Unknown error"), "error");
    } finally {
      setUploadingMedia(false);
    }
  };


  const handleLike = async (id: string, type: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1
        };
      }
      return p;
    }));
    
    await toggleLike(id, type);
  };

  const handleDelete = async (id: string, type: string) => {
    const ok = window.confirm("Delete this content?");
    if (!ok) return;
    const res = await deleteOwnContent(id, type as "POST" | "REEL");
    if (res.success) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      showToast("Content deleted", "success");
    } else {
      showToast(res.error || "Failed to delete content", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 pb-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="w-8" /> {/* Spacer */}
          <h1 className="text-xl font-black text-stone-900 tracking-tight">Society Feed</h1>
          <Link href="/search" className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 bg-stone-50 rounded-full hover:bg-stone-100 transition-colors">
            <FaSearch className="text-sm" />
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        
        {/* Stories Section */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-stone-100 mb-2">
          <StoryTray stories={stories} onAddStory={handleAddStory} />
        </div>
        
        {/* Post Composer */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100">
           <div className="flex gap-4">
             <div className="w-12 h-12 rounded-full bg-stone-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm relative">
               <Image 
                 src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Me')}`} 
                 alt="Me" 
                 fill
                 className="object-cover"
                 unoptimized={user?.image?.startsWith("https://ui-avatars.com")}
               />
             </div>
             <div className="flex-1">
                 <div className="relative">
                   <textarea 
                     value={newPostContent}
                     onChange={(e) => setNewPostContent(e.target.value)}
                     placeholder="Share an elite update with the circle..."
                     className="w-full bg-transparent border-none focus:ring-0 text-base font-medium text-stone-900 placeholder-stone-400 resize-none h-24"
                   />
                   <button 
                     onClick={() => setShowEmojis(!showEmojis)}
                     className="absolute bottom-2 right-0 text-stone-300 hover:text-yellow-500 transition-colors"
                   >
                     <FaSmile className="text-lg" />
                   </button>
                 </div>

                 {showEmojis && (
                   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4">
                     <EmojiPicker onSelect={(e) => { setNewPostContent(prev => prev + e); setShowEmojis(false); }} />
                   </motion.div>
                 )}
                
                {/* Media Preview */}
                <AnimatePresence>
                  {mediaUrl && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative mt-4 rounded-2xl overflow-hidden border border-stone-100 bg-stone-50 aspect-video"
                    >
                      {mediaType === "VIDEO" ? (
                        <video src={mediaUrl} className="w-full h-full object-cover" controls />
                      ) : (
                        <Image src={mediaUrl} className="w-full h-full object-cover" alt="Upload preview" fill unoptimized />
                      )}
                      <button 
                        onClick={() => { setMediaUrl(""); setMediaType(null); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-50">
                   <div className="flex items-center gap-4">
                     <input 
                       type="file" 
                       id="feed-media-upload" 
                       className="hidden" 
                       accept="image/*,video/*" 
                       onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (!file) return;
                         
                         // Client-side validations
                         if (file.size > 20 * 1024 * 1024) {
                           showToast("File too large. Max 20MB allowed.", "error");
                           return;
                         }

                         setUploadingMedia(true);
                         try {
                           const sigRes = await fetch("/api/upload/signature");
                           const sigData = await sigRes.json();
                           if (!sigData.success) throw new Error(sigData.error || "Failed to get upload signature");

                           const formData = new FormData();
                           formData.append("file", file);
                           formData.append("api_key", sigData.apiKey);
                           formData.append("timestamp", sigData.timestamp);
                           formData.append("signature", sigData.signature);
                           formData.append("folder", sigData.folder);

                           const res = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
                             method: "POST",
                             body: formData,
                           });

                           const data = await res.json();
                           if (!res.ok) throw new Error(data.error?.message || "Upload failed");
                           
                           setMediaUrl(data.secure_url);
                           setMediaType(file.type.startsWith("video") ? "VIDEO" : "IMAGE");
                         } catch (err) {
                           console.error("Upload failed", err);
                           showToast("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"), "error");
                         } finally {
                           setUploadingMedia(false);
                         }
                       }}

                     />
                     <label 
                       htmlFor="feed-media-upload"
                       className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 text-stone-500 text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-stone-100 transition-colors"
                     >
                       {uploadingMedia ? (
                         <div className="w-3 h-3 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                       ) : (
                         <FaCamera />
                       )}
                       <span>{mediaUrl ? "Change Media" : "Add Media"}</span>
                     </label>
                   </div>
                   
                   <button 
                     onClick={handleCreatePost}
                     disabled={isPosting || uploadingMedia || (!newPostContent.trim() && !mediaUrl)}
                     className="bg-stone-900 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform shadow-lg shadow-stone-200"
                   >
                     {isPosting ? "Posting..." : "Share"}
                   </button>
                </div>
             </div>
           </div>
        </div>

        {/* Feed Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">The feed is quiet today.</p>
          </div>
        ) : (
          posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
              canDelete={user?.id === post.user.id}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  );
}
