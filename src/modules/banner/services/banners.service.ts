import axiosInstance from '@/services/axios';
import { to24Hour } from '@/lib/time';

const BASE = '/api/v1/banners';

export type BannerStatusApi = 'draft' | 'scheduled' | 'published';

export interface BannerTheme {
  cta_button_color: string;
  text_color: string;
  background_color: string;
  cta_button_text_color: string;
}

// A banner as returned by create-banner.
export interface Banner {
  banner_id: string;
  title: string;
  description?: string;
  image_url: string;
  cta_text?: string;
  redirect_url?: string;
  webinar_date?: string;
  webinar_time?: string;
  category?: string;
  notify_users?: boolean;
  theme?: BannerTheme;
  status: BannerStatusApi;
  scheduled_date?: string;
  scheduled_time?: string;
  created_by?: string;
  updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

// create-banner is multipart/form-data. Only `title` and the image are
// strictly required by the backend; everything else is optional.
export interface CreateBannerInput {
  title: string;
  description?: string;
  imageFile: File;
  ctaText?: string;
  redirectUrl?: string;
  webinarDate?: string;
  webinarTime?: string;
  category?: string;
  notifyUsers?: boolean;
  theme?: BannerTheme;
  status: BannerStatusApi;
  scheduledDate?: string;
  scheduledTime?: string;
}

interface CreateBannerResponse {
  success: boolean;
  message: string;
  data: Banner;
}

// All fields optional for a partial update. `imageFile` replaces the image only
// when a new one is picked. Published banners can't be updated (backend rule).
export interface UpdateBannerInput {
  title?: string;
  description?: string;
  imageFile?: File | null;
  ctaText?: string;
  redirectUrl?: string;
  webinarDate?: string;
  webinarTime?: string;
  category?: string;
  notifyUsers?: boolean;
  theme?: BannerTheme;
  status?: BannerStatusApi;
  scheduledDate?: string;
  scheduledTime?: string;
}

export interface ListBannersParams {
  search?: string;
  status?: BannerStatusApi;
  category?: string;
  page?: number;
  limit?: number;
}

interface ListBannersResponse {
  success: boolean;
  banners: Banner[];
  // Pagination metadata — names vary by backend, so all are optional and
  // reconciled in listBanners().
  total?: number;
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pages?: number;
}

export interface BannersPage {
  banners: Banner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// List banners with optional search (title), status/category filter, and
// pagination.
export async function listBanners(params: ListBannersParams = {}): Promise<BannersPage> {
  const { page = 1, limit = 10 } = params;
  const { data } = await axiosInstance.get<ListBannersResponse>(BASE, {
    params: {
      ...(params.search ? { search: params.search } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.category ? { category: params.category } : {}),
      page,
      limit,
    },
  });
  if (!data.success) {
    throw new Error('Failed to load banners');
  }
  const banners = data.banners ?? [];
  const total = data.total ?? data.totalCount ?? banners.length;
  const totalPages = data.totalPages ?? data.pages ?? Math.max(1, Math.ceil(total / limit));
  return { banners, total, page: data.page ?? page, limit: data.limit ?? limit, totalPages };
}

interface SuggestedPaletteResponse {
  success: boolean;
  data: BannerTheme;
}

// The most frequently used CTA / text / background colors across all banners.
export async function getSuggestedPalette(): Promise<BannerTheme> {
  const { data } = await axiosInstance.get<SuggestedPaletteResponse>(`${BASE}/suggested-palette`);
  if (!data.success) {
    throw new Error('Failed to load suggested palette');
  }
  return data.data;
}

export async function createBanner(input: CreateBannerInput): Promise<Banner> {
  const form = new FormData();
  form.append('title', input.title);
  form.append('image_url', input.imageFile);
  form.append('status', input.status);
  // Optional text fields — only sent when provided so we don't overwrite with
  // empty strings.
  if (input.description) form.append('description', input.description);
  if (input.ctaText) form.append('cta_text', input.ctaText);
  if (input.redirectUrl) form.append('redirect_url', input.redirectUrl);
  if (input.webinarDate) form.append('webinar_date', input.webinarDate);
  // The API expects 24-hour "HH:MM"; the form stores "h:mm AM/PM".
  const webinarTime24 = input.webinarTime ? to24Hour(input.webinarTime) : '';
  if (webinarTime24) form.append('webinar_time', webinarTime24);
  if (input.category) form.append('category', input.category);
  if (input.notifyUsers != null) form.append('notify_users', String(input.notifyUsers));
  if (input.theme) form.append('theme', JSON.stringify(input.theme));
  // Schedule fields only matter for a scheduled banner.
  if (input.status === 'scheduled') {
    if (input.scheduledDate) form.append('scheduled_date', input.scheduledDate);
    const scheduledTime24 = input.scheduledTime ? to24Hour(input.scheduledTime) : '';
    if (scheduledTime24) form.append('scheduled_time', scheduledTime24);
  }

  const { data } = await axiosInstance.post<CreateBannerResponse>(BASE, form, {
    // Clear the default JSON Content-Type so the browser sets the multipart
    // boundary itself.
    headers: { 'Content-Type': null },
  });
  if (!data.success) {
    throw new Error(data.message || 'Failed to create banner');
  }
  return data.data;
}

// Partial update (multipart). Only provided fields are sent; the image is only
// replaced when a new file is supplied.
export async function updateBanner(id: string, input: UpdateBannerInput): Promise<Banner> {
  const form = new FormData();
  if (input.title) form.append('title', input.title);
  if (input.description !== undefined) form.append('description', input.description);
  if (input.imageFile) form.append('image_url', input.imageFile);
  // cta_text and redirect_url must be sent together (backend rule).
  if (input.ctaText && input.redirectUrl) {
    form.append('cta_text', input.ctaText);
    form.append('redirect_url', input.redirectUrl);
  }
  if (input.webinarDate) form.append('webinar_date', input.webinarDate);
  const webinarTime24 = input.webinarTime ? to24Hour(input.webinarTime) : '';
  if (webinarTime24) form.append('webinar_time', webinarTime24);
  if (input.category) form.append('category', input.category);
  if (input.notifyUsers != null) form.append('notify_users', String(input.notifyUsers));
  if (input.theme) form.append('theme', JSON.stringify(input.theme));
  if (input.status) form.append('status', input.status);
  if (input.status === 'scheduled') {
    if (input.scheduledDate) form.append('scheduled_date', input.scheduledDate);
    const scheduledTime24 = input.scheduledTime ? to24Hour(input.scheduledTime) : '';
    if (scheduledTime24) form.append('scheduled_time', scheduledTime24);
  }

  const { data } = await axiosInstance.put<CreateBannerResponse>(`${BASE}/${id}`, form, {
    headers: { 'Content-Type': null },
  });
  if (!data.success) {
    throw new Error(data.message || 'Failed to update banner');
  }
  return data.data;
}

interface DeleteBannerResponse {
  success: boolean;
  message: string;
}

// Soft-delete a banner.
export async function deleteBanner(id: string): Promise<void> {
  const { data } = await axiosInstance.delete<DeleteBannerResponse>(`${BASE}/${id}`);
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete banner');
  }
}
