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
      <div className="min-h-screen bg-white pt-24 items-center flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-10 px-6 pb-24">
      <div className="flex items-center gap-4 mb-8 text-black">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-xl">
          <FaUserEdit />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Account</h1>
      </div>

      <form className="space-y-6" onSubmit={handleUpdate}>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Legal Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 mt-1 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-0 transition-all font-medium text-foreground outline-none"
          />
        </div>
        
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Primary Email</label>
          <input
            type="email"
            value={profile?.email || "verified@sfselite.com"}
            disabled
            className="w-full px-4 py-3 mt-1 bg-secondary/50 border-2 border-transparent rounded-xl text-muted-foreground font-medium outline-none cursor-not-allowed"
          />
          <p className="text-[10px] text-muted-foreground mt-2 ml-1">Email cannot be changed after verification.</p>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Account Level</label>
          <div className="w-full px-4 py-3 mt-1 bg-secondary/50 rounded-xl text-foreground font-bold flex items-center justify-between">
            {profile?.membership}
            <span className="text-[10px] px-2 py-0.5 bg-primary rounded text-black font-black uppercase">Active</span>
          </div>
        </div>

        <button 
          disabled={saving}
          className={`w-full py-4 mt-6 text-sm font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-primary text-black'}`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : saved ? (
            <><FaCheck /> Updated</>
          ) : (
            <><FaSave /> Update Profile</>
          )}
        </button>
      </form>
    </div>
  );
}
