// Auth API layer. The functions are typed against the backend contract; the
// bodies currently mock a successful response so the UI flow works without a
// backend. To go live, replace each mock with the commented axios call.
//
//   import axiosInstance from '@/lib/axios';
//   import type { ApiResponse } from '@/types/api';

export interface SendOtpPayload {
  mobileNumber: string;
}

export interface SendOtpResult {
  otpSentTo: string;
  expiresInSeconds: number;
}

export interface VerifyOtpPayload {
  mobileNumber: string;
  otp: string;
}

export interface VerifyOtpResult {
  token: string;
}

const mockNetwork = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendOtp(payload: SendOtpPayload): Promise<SendOtpResult> {
  // TODO(api): const { data } = await axiosInstance.post<ApiResponse<SendOtpResult>>('/auth/send-otp', payload); return data.data;
  await mockNetwork();
  return { otpSentTo: payload.mobileNumber, expiresInSeconds: 30 };
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResult> {
  // TODO(api): const { data } = await axiosInstance.post<ApiResponse<VerifyOtpResult>>('/auth/verify-otp', payload); return data.data;
  await mockNetwork();
  if (payload.otp.length !== 4) {
    throw new Error('Invalid OTP. Please try again.');
  }
  return { token: 'mock-jwt-token' };
}
