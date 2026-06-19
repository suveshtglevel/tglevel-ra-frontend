import { useState } from 'react';
import { toast } from 'react-hot-toast';
import * as z from 'zod';
import { PublishOption } from '@/components/banner/constants/bannerData';
import { useCreateBanner } from '@/components/banner/hooks/useCreateBanner';
import { useUpdateBanner } from '@/components/banner/hooks/useBannerMutations';
import { getApiErrorMessage } from '@/lib/errors/api-error';
import { to12Hour } from '@/lib/time';
import type { Banner, BannerStatusApi } from '@/components/banner/services/banners.service';

export interface BannerFormState {
  image: string | null;
  // The picked file, kept alongside the data-URL preview so we can upload it.
  imageFile: File | null;
  title: string;
  description: string;
  ctaText: string;
  redirectUrl: string;
  webinarDate: string;
  webinarTime: string;
  category: string;
  notify: boolean;
  ctaColor: string;
  ctaTextColor: string;
  textColor: string;
  bgColor: string;
  // No option is selected by default; the user must pick one manually.
  publishOption: PublishOption | null;
  scheduleDate: string;
  scheduleTime: string;
}

// Title is always required; the image is required only when publishing/scheduling.
const titleSchema = z.object({
  title: z.string().trim().min(1, 'Banner title is required'),
});

// Maps the UI's publish choice to the backend status value.
const STATUS_BY_OPTION: Record<PublishOption, BannerStatusApi> = {
  now: 'published',
  schedule: 'scheduled',
  draft: 'draft',
};

// Reverse map, for loading an existing banner back into the form.
const OPTION_BY_STATUS: Record<BannerStatusApi, PublishOption> = {
  published: 'now',
  scheduled: 'schedule',
  draft: 'draft',
};

// Normalize a date (ISO or "YYYY-MM-DD") to the "YYYY-MM-DD" a date input needs.
const toDateInput = (value?: string): string => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const INITIAL: BannerFormState = {
  image: null,
  imageFile: null,
  title: 'Smart Trading Masterclass',
  description: '',
  ctaText: 'Register',
  redirectUrl: '',
  webinarDate: '2026-06-08',
  webinarTime: '10:00 AM',
  category: 'Webinar',
  notify: true,
  ctaColor: '#10B981',
  ctaTextColor: '#FFFFFF',
  textColor: '#F8FAFC',
  bgColor: '#0B1F33',
  publishOption: null,
  scheduleDate: '2026-06-15',
  scheduleTime: '09:30 AM',
};

export const useBannerForm = () => {
  const [state, setState] = useState<BannerFormState>(INITIAL);
  // The banner_id being edited, or null when creating a new banner.
  const [editingId, setEditingId] = useState<string | null>(null);
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const saving = createBanner.isPending || updateBanner.isPending;

  const set = <K extends keyof BannerFormState>(key: K, value: BannerFormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  // Load an existing banner into the form for editing. Times come back 24-hour
  // and dates may be ISO, so both are converted to the form's formats.
  const loadForEdit = (banner: Banner) => {
    setEditingId(banner.banner_id);
    setState({
      image: banner.image_url || null,
      imageFile: null,
      title: banner.title ?? '',
      description: banner.description ?? '',
      ctaText: banner.cta_text ?? '',
      redirectUrl: banner.redirect_url ?? '',
      webinarDate: toDateInput(banner.webinar_date),
      webinarTime: to12Hour(banner.webinar_time ?? '') || INITIAL.webinarTime,
      category: banner.category ?? 'Webinar',
      notify: banner.notify_users ?? true,
      ctaColor: banner.theme?.cta_button_color ?? INITIAL.ctaColor,
      ctaTextColor: banner.theme?.cta_button_text_color ?? INITIAL.ctaTextColor,
      textColor: banner.theme?.text_color ?? INITIAL.textColor,
      bgColor: banner.theme?.background_color ?? INITIAL.bgColor,
      publishOption: OPTION_BY_STATUS[banner.status] ?? null,
      scheduleDate: toDateInput(banner.scheduled_date) || INITIAL.scheduleDate,
      scheduleTime: to12Hour(banner.scheduled_time ?? '') || INITIAL.scheduleTime,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setState(INITIAL);
  };

  const onImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setState((prev) => ({ ...prev, image: reader.result as string, imageFile: file }));
      toast.success('Banner image uploaded');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => setState((prev) => ({ ...prev, image: null, imageFile: null }));

  const reset = () => {
    setState(INITIAL);
    toast.success('Form reset');
  };

  const save = () => {
    if (saving) return;

    const option = state.publishOption;
    // No option is selected by default — the user must choose one first.
    if (!option) {
      toast.error('Please select a publishing option');
      return;
    }

    const result = titleSchema.safeParse(state);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Please complete the form');
      return;
    }

    const status = STATUS_BY_OPTION[option];
    const theme = {
      cta_button_color: state.ctaColor,
      text_color: state.textColor,
      background_color: state.bgColor,
      cta_button_text_color: state.ctaTextColor,
    };
    const successLabel = () =>
      option === 'now'
        ? 'Banner published'
        : option === 'schedule'
          ? `Banner scheduled for ${state.scheduleDate} at ${state.scheduleTime}`
          : 'Saved as draft';

    // Edit: image is optional (the existing one is kept unless replaced).
    if (editingId) {
      updateBanner.mutate(
        {
          id: editingId,
          input: {
            title: state.title.trim(),
            description: state.description,
            imageFile: state.imageFile,
            ctaText: state.ctaText,
            redirectUrl: state.redirectUrl,
            webinarDate: state.webinarDate,
            webinarTime: state.webinarTime,
            category: state.category,
            notifyUsers: state.notify,
            theme,
            status,
            scheduledDate: state.scheduleDate,
            scheduledTime: state.scheduleTime,
          },
        },
        {
          onSuccess: () => {
            toast.success('Banner updated');
            setEditingId(null);
            setState(INITIAL);
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
      return;
    }

    // Create: the backend requires the image for every banner (incl. drafts).
    if (!state.imageFile) {
      toast.error('Please upload a banner image');
      return;
    }

    createBanner.mutate(
      {
        title: state.title.trim(),
        description: state.description,
        imageFile: state.imageFile,
        ctaText: state.ctaText,
        redirectUrl: state.redirectUrl,
        webinarDate: state.webinarDate,
        webinarTime: state.webinarTime,
        category: state.category,
        notifyUsers: state.notify,
        theme,
        status,
        scheduledDate: state.scheduleDate,
        scheduledTime: state.scheduleTime,
      },
      {
        onSuccess: () => {
          toast.success(successLabel());
          setState(INITIAL);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return {
    ...state,
    isEditing: editingId !== null,
    set,
    onImageUpload,
    removeImage,
    reset,
    save,
    loadForEdit,
    cancelEdit,
    saving,
  };
};

export type UseBannerForm = ReturnType<typeof useBannerForm>;
