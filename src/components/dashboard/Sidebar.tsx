'use client';

import React from 'react';
import { MessageSquare, MonitorPlay, Settings, Pencil, LogOut, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

type SidebarTab = 'chat' | 'monitor' | 'settings';

const Sidebar = () => {
  const [activeTab, setActiveTab] = React.useState<SidebarTab>('chat');
  const [showProfile, setShowProfile] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState<string | null>(null);

  const profileRef = React.useRef<HTMLDivElement>(null);
  const settingsRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Close popups on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleTabClick = (tab: SidebarTab) => {
    setActiveTab(tab);
    if (tab === 'monitor') toast('Live monitor coming soon!', { icon: '📺' });
    if (tab === 'settings') {
      setShowSettings((prev) => !prev);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('Profile image updated!');
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    // When API is ready: call logout API, clear tokens, redirect
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 1000);
  };

  return (
    <aside className="w-16 flex flex-col items-center py-6 bg-white border-r border-slate-200 gap-8 shrink-0">
      <div
        onClick={() => { setActiveTab('chat'); setShowSettings(false); }}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors",
          activeTab === 'chat' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400 hover:text-slate-600"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </div>
      <nav className="flex flex-col gap-6 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleTabClick('monitor')}
          className={cn(
            "cursor-pointer transition-colors",
            activeTab === 'monitor' ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <MonitorPlay className="w-6 h-6" />
        </Button>
        <div
          ref={profileRef}
          onClick={() => setShowProfile(!showProfile)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-colors relative overflow-visible",
            showProfile ? "ring-2 ring-emerald-300" : "hover:ring-2 hover:ring-slate-200"
          )}
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
              TJ
            </div>
          )}
          {showProfile && (
            <div className="absolute left-14 top-0 bg-white border border-slate-200 rounded-xl shadow-lg p-4 w-48 z-50">
              <p className="font-bold text-slate-800 text-sm">Alex Mercer</p>
              <p className="text-xs text-slate-400 mt-1">alex.mercer@tg.com</p>
              <div className="h-[1px] bg-slate-100 my-2" />
              <p className="text-xs text-slate-500">Role: Research Analyst</p>
              <p className="text-xs text-slate-500 mt-1">Status: Online</p>
            </div>
          )}
        </div>
      </nav>

      {/* Settings button with profile card */}
      <div ref={settingsRef} className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleTabClick('settings')}
          className={cn(
            "cursor-pointer transition-colors",
            activeTab === 'settings' ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Settings className="w-6 h-6" />
        </Button>

        {/* Settings Profile Card */}
        {showSettings && (
          <div className="absolute bottom-0 left-16 w-[280px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="flex flex-col items-center pt-8 pb-5 px-6">
              {/* Profile Image */}
              <div className="w-[90px] h-[90px] rounded-full border-[3px] border-slate-200 overflow-hidden mb-4">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold">
                    AM
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className="text-[16px] font-bold text-slate-800">Alex Mercer</h3>

              {/* Email */}
              <div className="flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-[13px] text-slate-500">alex.mercer@tg.com</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 mt-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-[13px] text-slate-500">+91 98765 43210</span>
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-slate-100 my-5" />

              {/* Edit Profile Image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-emerald-600 font-medium text-[13px] cursor-pointer bg-transparent border-none hover:text-emerald-700 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile image
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 w-full py-2.5 rounded-full bg-red-50 text-red-500 font-medium text-[13px] flex items-center justify-center gap-2 cursor-pointer border-none hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
