"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaVideo, 
  FaFolderOpen, 
  FaTimes, 
  FaCheck, 
  FaCamera, 
  FaArrowLeft,
  FaUpload,
  FaMagic,
  FaMusic
} from "react-icons/fa";
import { createReel } from "./actions";

export default function CreateReelPage() {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "record" | "preview" | "uploading">("select");
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStep("record");
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please grant camera/microphone permissions to continue.");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const options = { mimeType: "video/webm;codecs=vp9" };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = "video/webm";
    }
    
    const mediaRecorder = new MediaRecorder(streamRef.current, options);
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setVideoBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setStep("preview");
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    
    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          alert("Video too long. Max 1 minute allowed for reels.");
          return;
        }
        setVideoBlob(file);
        setPreviewUrl(URL.createObjectURL(file));
        setStep("preview");
      };
      video.src = URL.createObjectURL(file);
    }
  };


  const handlePost = async () => {
    if (!videoBlob) return;
    setStep("uploading");
    setUploadProgress(10);

    try {
      setUploadProgress(30);
      const formData = new FormData();
      formData.append("file", videoBlob);
      
      const resUpload = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      
      const data = await resUpload.json();
      if (!data.success) throw new Error(data.error || "Upload failed");

      setUploadProgress(90);
      const res = await createReel(data.url, caption);

      if (res.success) {
        setUploadProgress(100);
        setTimeout(() => router.push("/reels"), 500);
      } else {
        alert(res.error);
        setStep("preview");
      }
    } catch (err) {
      console.error("Posting error:", err);
      alert("Failed to post reel: " + (err instanceof Error ? err.message : "Unknown error"));
      setStep("preview");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-white flex flex-col z-[100] font-sans">
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div 
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden max-w-[450px] mx-auto w-full border-x border-white/5"
          >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none" />
            
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-yellow-500/20 rotate-12"
            >
              <FaVideo className="text-4xl text-black" />
            </motion.div>
            
            <h1 className="text-4xl font-black mb-4 tracking-tight uppercase">Create a Reel</h1>
            <p className="text-stone-400 mb-12 max-w-xs font-medium leading-relaxed">
              Show the society your most elite moments. High quality content gets boosted.
            </p>
            
            <div className="w-full space-y-4 max-w-sm px-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startCamera}
                className="w-full py-5 bg-yellow-400 text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-4 shadow-xl shadow-yellow-400/10"
              >
                <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
                  <FaCamera className="text-sm" />
                </div>
                Record Studio
              </motion.button>
              
              <label className="group w-full py-5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-4 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <FaFolderOpen className="text-sm" />
                </div>
                Import Media
                <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            
            <button 
              onClick={() => router.back()}
              className="mt-12 text-stone-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
            >
              Go Back
            </button>
          </motion.div>
        )}

        {step === "record" && (
          <motion.div 
            key="record"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 relative bg-black max-w-[450px] mx-auto w-full border-x border-white/5"
          >
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover opacity-90"
            />
            
            {/* Camera Overlay */}
            <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 rounded-3xl" />
            
            <div className="absolute top-12 left-6 right-6 flex justify-between items-center pointer-events-auto">
              <button onClick={() => setStep("select")} className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors">
                <FaArrowLeft className="text-lg" />
              </button>
              
              <div className="px-5 py-2 bg-black/80 backdrop-blur-md rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 border border-white/20 shadow-2xl">
                <div className={`w-2.5 h-2.5 rounded-full bg-white ${recording ? 'animate-pulse' : ''}`} />
                {formatTime(recordingTime)}
              </div>
              
              <div className="w-12 h-12" />
            </div>

            {/* Recording Button */}
            <div className="absolute bottom-16 left-0 right-0 flex justify-center items-center pointer-events-auto">
              <div className="flex flex-col items-center gap-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                  {recording ? "Recording..." : "Hold to Record"}
                </p>
                <motion.button 
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-24 h-24 rounded-full border-4 ${recording ? 'border-white' : 'border-yellow-400'} flex items-center justify-center transition-all p-1`}
                >
                  <div className={`rounded-full bg-yellow-400 transition-all duration-300 ${recording ? 'w-10 h-10 rounded-xl bg-white' : 'w-20 h-20 shadow-2xl shadow-yellow-400/40'}`} />
                  {recording && (
                    <motion.div 
                      initial={{ scale: 1 }}
                      animate={{ scale: 1.2, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute inset-0 border-4 border-white rounded-full"
                    />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "preview" && (
          <motion.div 
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col bg-[#0a0a0a] max-w-[450px] mx-auto w-full border-x border-white/5"
          >
            <div className="relative h-[55%] min-h-[300px] overflow-hidden rounded-b-[40px] shadow-2xl">
              <video 
                src={previewUrl || ""} 
                autoPlay 
                muted 
                loop 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <button 
                onClick={() => setStep("select")}
                className="absolute top-12 left-6 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10"
              >
                <FaTimes />
              </button>
              
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
                    <FaMusic className="text-xs" />
                  </div>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
                    <FaMagic className="text-xs" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">Add Caption</label>
                  <span className="text-[10px] text-stone-500 font-bold">{caption.length}/280</span>
                </div>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share the story behind this moment..."
                  maxLength={280}
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-stone-600 focus:border-yellow-400/50 focus:bg-white/[0.07] outline-none resize-none transition-all font-medium leading-relaxed text-sm"
                />
              </div>

              <div className="pt-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePost}
                  className="w-full py-5 bg-yellow-400 text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-4 shadow-2xl shadow-yellow-400/20 active:bg-yellow-500"
                >
                  <FaCheck className="text-sm" />
                  Publish to Elite Society
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "uploading" && (
          <motion.div 
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-[450px] mx-auto w-full border-x border-white/5"
          >
            <div className="relative w-32 h-32 mb-12">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="377"
                  animate={{ strokeDashoffset: 377 - (377 * uploadProgress) / 100 }}
                  className="text-yellow-400"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaUpload className="text-3xl text-yellow-400 animate-bounce" />
              </div>
            </div>
            
            <h2 className="text-3xl font-black uppercase tracking-tight mb-3">Broadcasting</h2>
            <p className="text-stone-500 font-medium max-w-xs mx-auto">
              Your elite moment is being processed and published to the network.
            </p>
            
            <div className="mt-8 w-full max-w-[200px] h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto">
              <motion.div 
                className="h-full bg-yellow-400"
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
