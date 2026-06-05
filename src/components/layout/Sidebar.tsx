'use client';

import React,{useState, useRef} from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, MonitorPlay, Settings, Pencil, LogOut, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { clearSession, persistUser } from '@/services/session';
import { logout as logoutApi, updateProfileImage } from '@/modules/auth/services/auth.service';
import { getApiErrorMessage } from '@/lib/errors/api-error';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as logoutAction, updateUser } from '@/store/slices/authSlice';

type SidebarTab = 'chat' | 'webinar' | 'tradeJournal' | 'tradeFeedback' | 'settings';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  // Initials for the avatar fallback, from the RA's display name.
  const initials =
    user?.name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'RA';
  const [showSettings, setShowSettings] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Show the saved avatar from the auth state; an in-flight upload swaps in a
  // local preview until the server URL comes back.
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const profileImage = previewImage ?? user?.avatarUrl ?? null;

  const settingsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close popups on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeTab: SidebarTab = showSettings
    ? 'settings'
    : pathname?.startsWith('/banner')
    ? 'webinar'
    : pathname?.startsWith('/trade-journal')
    ? 'tradeJournal'
    : pathname?.startsWith('/trade-feedback')
    ? 'tradeFeedback'
    : 'chat';

  const handleTabClick = (tab: SidebarTab) => {
    if (tab === 'chat') {
      setShowSettings(false);
      router.push('/dashboard');
    }
    if (tab === 'webinar') {
      setShowSettings(false);
      router.push('/banner');
    }
    if (tab === 'tradeJournal') {
      setShowSettings(false);
      router.push('/trade-journal');
    }
    if (tab === 'tradeFeedback') {
      setShowSettings(false);
      router.push('/trade-feedback');
    }
    if (tab === 'settings') {
      setShowSettings((prev) => !prev);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || uploadingImage) return;

    // Optimistic local preview while the upload is in flight.
    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);
    setUploadingImage(true);

    try {
      const result = await updateProfileImage(file);
      const avatarUrl = result.data.profile_picture;
      dispatch(updateUser({ avatarUrl }));
      if (user) persistUser({ ...user, avatarUrl });
      // Drop the local preview now that the saved URL is in the auth state.
      setPreviewImage(null);
      toast.success(result.message || 'Profile image updated!');
    } catch (error) {
      setPreviewImage(null);
      toast.error(getApiErrorMessage(error));
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    let message = 'Logged out successfully!';
    try {
      // Clear the refresh cookie server-side; ignore failures so the client
      // session is dropped regardless.
      const result = await logoutApi();
      if (result?.message) message = result.message;
    } catch {
      // no-op
    }
    clearSession();
    dispatch(logoutAction());
    toast.success(message);
    router.replace('/login');
  };

  return (
    <aside className="w-16 flex flex-col items-center py-6 bg-white border-r border-slate-200 gap-8 shrink-0">
      <nav className="flex flex-col gap-6 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleTabClick('chat')}
          className={cn(
            "cursor-pointer transition-colors",
            activeTab === 'chat' ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleTabClick('webinar')}
          className={cn(
            "cursor-pointer transition-colors",
            activeTab === 'webinar' ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <MonitorPlay className="w-6 h-6" />
        </Button>
        <button
          type="button"
          aria-label="Trade Journal"
          onClick={() => handleTabClick('tradeJournal')}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-colors",
            activeTab === 'tradeJournal'
              ? "bg-emerald-50 text-emerald-600 ring-2 ring-emerald-300"
              : "bg-slate-100 text-slate-500 hover:ring-2 hover:ring-slate-200"
          )}
        >
          TJ
        </button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Trade Feedback"
          onClick={() => handleTabClick('tradeFeedback')}
          className={cn(
            "cursor-pointer transition-colors",
            activeTab === 'tradeFeedback' ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Image src="/trade-feedback.png" alt="Trade Feedback" width={24} height={24} className="w-6 h-6 object-contain" />
        </Button>
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
          <div className="absolute bottom-0 left-16 w-[280px] max-w-[calc(100vw-5rem)] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="flex flex-col items-center pt-8 pb-5 px-6">
              {/* Profile Image */}
              <div className="w-[90px] h-[90px] rounded-full border-[3px] border-slate-200 overflow-hidden mb-4 relative">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold">
                    {initials}
                  </div>
                )}
              </div>

              {/* Display name */}
              <h3 className="text-[16px] font-bold text-slate-800 text-center break-words">
                {user?.name || 'RA'}
              </h3>

              {/* Email (only when available) */}
              {user?.email && (
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-[13px] text-slate-500">{user.email}</span>
                </div>
              )}

              {/* Phone number */}
              {user?.phone && (
                <div className="flex items-center gap-2 mt-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-[13px] text-slate-500">{user.phone}</span>
                </div>
              )}

              {/* Divider */}
              <div className="w-full h-[1px] bg-slate-100 my-5" />

              {/* Edit Profile Image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-2 text-emerald-600 font-medium text-[13px] cursor-pointer bg-transparent border-none hover:text-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Pencil className="w-4 h-4" />
                {uploadingImage ? 'Uploading…' : 'Edit Profile image'}
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-4 w-full py-2.5 rounded-full bg-red-50 text-red-500 font-medium text-[13px] flex items-center justify-center gap-2 cursor-pointer border-none hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? 'Logging out…' : 'Logout'}
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
