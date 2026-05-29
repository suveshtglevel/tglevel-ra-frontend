'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { sendOtp, verifyOtp } from '@/lib/api/auth';
import type { SendOtpPayload, VerifyOtpPayload } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/errors';

export function useSendOtp() {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: SendOtpPayload) => sendOtp(payload),
    onSuccess: (_result, variables) => {
      toast.success('OTP sent to your mobile number');
      router.push(`/auth/verify-otp?mobile=${encodeURIComponent(variables.mobileNumber)}`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useVerifyOtp() {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
    onSuccess: (result) => {
      // Secure token handling: scoped cookie, strict same-site, https-only in prod.
      Cookies.set('token', result.token, {
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      toast.success('Logged in successfully');
      router.push('/dashboard');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

// Standalone resend (no navigation) for the OTP screen's resend action.
export function useResendOtp() {
  return useMutation({
    mutationFn: (payload: SendOtpPayload) => sendOtp(payload),
    onSuccess: () => toast.success('A new OTP has been sent'),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
