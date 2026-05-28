import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PublishOption } from '@/constants/webinarData';

export interface WebinarBannerState {
  image: string | null;
  title: string;
  description: string;
  ctaText: string;
  redirectUrl: string;
  webinarDate: string;
  webinarTime: string;
  category: string;
  notify: boolean;
  ctaColor: string;
  textColor: string;
  bgColor: string;
  publishOption: PublishOption;
  scheduleDate: string;
  scheduleTime: string;
}

const INITIAL: WebinarBannerState = {
  image: null,
  title: 'Smart Trading Masterclass',
  description: '',
  ctaText: 'Register',
  redirectUrl: '',
  webinarDate: '08 June',
  webinarTime: '10:00 AM',
  category: 'Webinar',
  notify: true,
  ctaColor: '#10B981',
  textColor: '#F8FAFC',
  bgColor: '#0B1F33',
  publishOption: 'schedule',
  scheduleDate: '15 June 2024',
  scheduleTime: '09:30 AM',
};

export const useWebinarBanner = () => {
  const [state, setState] = useState<WebinarBannerState>(INITIAL);

  const set = <K extends keyof WebinarBannerState>(key: K, value: WebinarBannerState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const onImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      set('image', reader.result as string);
      toast.success('Banner image uploaded');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => set('image', null);

  const reset = () => {
    setState(INITIAL);
    toast.success('Form reset');
  };

  const save = () => {
    const label =
      state.publishOption === 'now'
        ? 'Banner published'
        : state.publishOption === 'schedule'
          ? `Banner scheduled for ${state.scheduleDate} at ${state.scheduleTime}`
          : 'Saved as draft';
    toast.success(label);
  };

  return { ...state, set, onImageUpload, removeImage, reset, save };
};

export type UseWebinarBanner = ReturnType<typeof useWebinarBanner>;
