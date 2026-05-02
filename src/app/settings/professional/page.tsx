"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaLinkedin, FaBriefcase, FaGlobe, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { updateProfileSettings } from "../actions";
import { useToast } from "@/app/providers/ToastProvider";

export default function ProfessionalSettingsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Form state
  const [isNetworkingMode, setIsNetworkingMode] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");

  useEffect(() => {
    // Fetch current user's profile
    // Note: In a real app, you'd have a specific "getMe" profile action
    // Using current session user id would be better.
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateProfileSettings({
      isNetworkingMode,
      linkedinUrl,
      company,
      industry,
    });
    setSaving(false);
    if (res.success) {
      showToast("Professional profile updated!", "success");
      router.back();
    } else {
      showToast(res.error || "Failed to update profile", "error");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-card p-6 border-b border-white/5 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-white transition-colors">
          <FaArrowLeft />
        </button>
        <h1 className="text-xl font-black text-foreground tracking-tight uppercase tracking-widest text-[11px]">Professional Elite</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Collaborator Mode Toggle */}
        <div className="bg-secondary rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-6 transition-transform">
            <FaBriefcase className="text-[10rem]" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4 flex items-center gap-3 tracking-tighter uppercase">
              Collaborator Mode
              {isNetworkingMode && <FaCheckCircle className="text-primary text-xl" />}
            </h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed font-medium">
              Switching to Collaborator Mode prioritizes professional networking and partnership discovery. Your profile will be highlighted to other founders and creators.
            </p>
            <button 
              onClick={() => setIsNetworkingMode(!isNetworkingMode)}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${
                isNetworkingMode 
                ? "bg-primary text-white shadow-primary/20" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {isNetworkingMode ? "Active" : "Activate Elite Mode"}
            </button>
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Verification & Digital Links</h3>
          
          <div className="bg-card rounded-[2.5rem] p-8 border border-white/5 shadow-2xl space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">LinkedIn Identity</label>
              <div className="relative">
                <FaLinkedin className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0077B5] text-lg" />
                <input 
                  type="text" 
                  placeholder="linkedin.com/in/username"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-black text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-muted-foreground/20"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Company / Venture</label>
              <div className="relative">
                <FaBriefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="e.g. SFS Elite"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-black text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-muted-foreground/20"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Industry Focus</label>
              <div className="relative">
                <FaGlobe className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="e.g. Fintech, AI, Web3"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-black text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-muted-foreground/20"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 hover:opacity-90"
        >
          {saving ? <FaSpinner className="animate-spin text-lg" /> : "Secure Professional Identity"}
        </button>
      </div>
    </div>
  );
}

