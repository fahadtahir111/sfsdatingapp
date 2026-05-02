"use client";

import { useEffect, useState } from "react";
import { getProfile, updateAccount } from "../../profile/actions";
import { FaUserEdit, FaSave, FaCheck } from "react-icons/fa";

export default function AccountSettings() {
  const [profile, setProfile] = useState<{ email?: string | null; membership?: string | null; name?: string | null } | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile().then(data => {
      setProfile(data);
      setName(data?.name || "");
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAccount({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Update failed", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 items-center flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-10 px-6 pb-24">
      <div className="flex items-center gap-4 mb-10 text-white">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-xl text-white shadow-lg shadow-primary/20">
          <FaUserEdit />
        </div>
        <h1 className="text-3xl font-black tracking-tight uppercase tracking-tighter">Account</h1>
      </div>

      <form className="space-y-8" onSubmit={handleUpdate}>
        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Legal Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-6 py-4 bg-card border border-white/5 rounded-2xl focus:border-primary focus:ring-0 transition-all font-black text-white outline-none shadow-xl"
          />
        </div>
        
        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Primary Email</label>
          <input
            type="email"
            value={profile?.email || "verified@sfselite.com"}
            disabled
            className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-muted-foreground/60 font-bold outline-none cursor-not-allowed"
          />
          <p className="text-[10px] text-muted-foreground/40 mt-2 ml-1 font-medium">Email cannot be changed after verification.</p>
        </div>

        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">Account Level</label>
          <div className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-black flex items-center justify-between uppercase tracking-widest text-xs">
            {profile?.membership}
            <span className="text-[10px] px-3 py-1 bg-primary rounded-lg text-white font-black uppercase shadow-lg shadow-primary/20">Active</span>
          </div>
        </div>

        <button 
          disabled={saving}
          className={`w-full py-5 mt-8 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl active:scale-95 transition-all flex justify-center items-center gap-3 ${saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white shadow-primary/20'}`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : saved ? (
            <><FaCheck className="text-lg" /> Profile Secured</>
          ) : (
            <><FaSave className="text-lg" /> Update Identity</>
          )}
        </button>
      </form>
    </div>
  );
}
