"use client";

import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { getProfile, updateNotifications } from "../../profile/actions";

export default function NotificationsSettings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [matchesEnabled, setMatchesEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(data => {
      setPushEnabled(data?.pushEnabled ?? true);
      setEmailEnabled(data?.emailEnabled ?? false);
      setMatchesEnabled(data?.matchesEnabled ?? true);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    const updateMap: Record<string, (v: boolean) => void> = {
      push: setPushEnabled,
      email: setEmailEnabled,
      matches: setMatchesEnabled
    };
    
    // Optimistic update
    updateMap[key](value);

    try {
      await updateNotifications({
        [`${key}Enabled`]: value
      });
    } catch (e) {
      console.error("Failed to update notification", e);
      updateMap[key](!value); // Rollback
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
          <FaBell />
        </div>
        <h1 className="text-3xl font-black tracking-tight uppercase tracking-tighter">Alerts</h1>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-6 border border-white/5 rounded-[1.75rem] bg-card shadow-xl">
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-[10px]">Push Notifications</h3>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">Get alerts instantly on your device.</p>
          </div>
          <button 
            onClick={() => handleToggle('push', !pushEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${pushEnabled ? 'bg-primary' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${pushEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-6 border border-white/5 rounded-[1.75rem] bg-card shadow-xl">
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-[10px]">Email Summaries</h3>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">Weekly digests of your activity.</p>
          </div>
          <button 
            onClick={() => handleToggle('email', !emailEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${emailEnabled ? 'bg-primary' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${emailEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-6 border border-white/5 rounded-[1.75rem] bg-card shadow-xl">
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-[10px]">Elite Connections</h3>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">Notify me immediately when I connect.</p>
          </div>
          <button 
            onClick={() => handleToggle('matches', !matchesEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${matchesEnabled ? 'bg-primary' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${matchesEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
