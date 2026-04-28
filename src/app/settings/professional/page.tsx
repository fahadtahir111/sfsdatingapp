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
    <div className="min-h-screen bg-[#f8f7f5] pb-24">
      <div className="bg-white p-6 border-b border-stone-100 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-stone-400">
          <FaArrowLeft />
        </button>
        <h1 className="text-xl font-black text-stone-900 tracking-tight">Professional Elite</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Collaborator Mode Toggle */}
        <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <FaBriefcase className="text-8xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              Collaborator Mode
              {isNetworkingMode && <FaCheckCircle className="text-yellow-400 text-sm" />}
            </h2>
            <p className="text-stone-400 text-sm mb-6 leading-relaxed">
              Switching to Collaborator Mode prioritizes professional networking and partnership discovery. Your profile will be highlighted to other founders and creators.
            </p>
            <button 
              onClick={() => setIsNetworkingMode(!isNetworkingMode)}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                isNetworkingMode 
                ? "bg-yellow-400 text-stone-900" 
                : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isNetworkingMode ? "Active" : "Activate Mode"}
            </button>
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-2">Verification & Links</h3>
          
          <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">LinkedIn Profile</label>
              <div className="relative">
                <FaLinkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" />
                <input 
                  type="text" 
                  placeholder="linkedin.com/in/username"
                  className="w-full bg-stone-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Company / Project</label>
              <div className="relative">
                <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="e.g. SFS Elite"
                  className="w-full bg-stone-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Industry</label>
              <div className="relative">
                <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="e.g. Fintech, AI, Web3"
                  className="w-full bg-stone-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none"
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
          className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black text-sm shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <FaSpinner className="animate-spin" /> : "Save Professional Profile"}
        </button>
      </div>
    </div>
  );
}
