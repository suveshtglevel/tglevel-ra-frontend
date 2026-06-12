import * as z from 'zod';
import axiosInstance from '@/services/axios';
import { parseResponse } from '@/lib/validate';

const BASE = '/api/v1/ra';

// Lenient runtime schemas for the responses the app depends on. `.loose()` lets
// unknown keys through; only fields the UI actually reads are required.
const sendOtpResponseSchema = z
  .object({ success: z.boolean(), message: z.string().optional() })
  .loose();

const loginResponseSchema = z
  .object({
    success: z.boolean(),
    accessToken: z.string(),
    data: z
      .object({
        ra_id: z.string(),
        display_name: z.string(),
        phone_number: z.string(),
        assigned_communities: z.array(z.string()),
        // Backend sends `null` (not an omitted key) when an RA has no image.
        // `.nullish()` accepts string | null | undefined; `.optional()` would
        // reject the `null` and fail the whole login validation.
        profile: z.string().nullish(),
        profile_picture: z.string().nullish(),
      })
      .loose(),
  })
  .loose();

export interface SendOtpPayload {
  mobileNumber: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpPayload {
  mobileNumber: string;
  otp: string;
}

export interface ResearchAnalyst {
  _id: string;
  display_name: string;
  phone_number: string;
  status: string;
  assigned_communities: string[];
  profile?: string;
  profile_picture?: string;
  ra_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  data: ResearchAnalyst;
}

export async function sendOtp(payload: SendOtpPayload): Promise<SendOtpResponse> {
  const { data } = await axiosInstance.post<SendOtpResponse>(`${BASE}/send-otp`, {
    phone_number: payload.mobileNumber,
  });
  parseResponse(sendOtpResponseSchema, data, 'send-OTP');
  if (!data.success) {
    throw new Error(data.message || 'Failed to send OTP');
  }
  return data;
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>(`${BASE}/verify-otp`, {
    phone_number: payload.mobileNumber,
    otp: payload.otp,
  });
  if (!data.success) {
    throw new Error(data.message || 'Login failed');
  }
  // Validate only a successful login — a broken session shape must never reach
  // the store. (Failure responses are handled above.)
  parseResponse(loginResponseSchema, data, 'login');
  return data;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Invalidate the session server-side: clears the HttpOnly ra_refreshToken
// cookie. Sent with credentials + bearer token (both via the axios instance).
export async function logout(): Promise<LogoutResponse> {
  const { data } = await axiosInstance.post<LogoutResponse>(`${BASE}/logout`);
  return data;
}

export interface UpdateProfileImageResponse {
  success: boolean;
  message: string;
  data: {
    ra_id: string;
    display_name: string;
    profile_picture: string;
  };
}

// Upload a new RA profile picture (multipart). The default instance Content-Type
// is application/json, which would make axios JSON-stringify the FormData; we
// override it to multipart/form-data so the browser sends the file with a
// proper boundary.
export async function updateProfileImage(file: File): Promise<UpdateProfileImageResponse> {
  const form = new FormData();
  form.append('profile_picture', file);
  const { data } = await axiosInstance.put<UpdateProfileImageResponse>(
    `${BASE}/update-profile-image`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  if (!data.success) {
    throw new Error(data.message || 'Failed to update profile image');
  }
  return data;
}
