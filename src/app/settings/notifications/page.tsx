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
      <div className="min-h-screen bg-white pt-24 items-center flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-10 px-6 pb-24">
      <div className="flex items-center gap-4 mb-8 text-black">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-xl">
          <FaBell />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Alerts</h1>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-secondary/10">
          <div>
            <h3 className="font-bold text-foreground">Push Notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">Get alerts instantly on your device.</p>
          </div>
          <button 
            onClick={() => handleToggle('push', !pushEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${pushEnabled ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${pushEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-secondary/10">
          <div>
            <h3 className="font-bold text-foreground">Email Summaries</h3>
            <p className="text-xs text-muted-foreground mt-1">Weekly digests of your activity.</p>
          </div>
          <button 
            onClick={() => handleToggle('email', !emailEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${emailEnabled ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${emailEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-secondary/10">
          <div>
            <h3 className="font-bold text-foreground">New Matches</h3>
            <p className="text-xs text-muted-foreground mt-1">Notify me immediately when I match.</p>
          </div>
          <button 
            onClick={() => handleToggle('matches', !matchesEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${matchesEnabled ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${matchesEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
