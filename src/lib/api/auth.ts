import axiosInstance from '@/lib/axios';

const BASE = '/api/v1/ra';

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
