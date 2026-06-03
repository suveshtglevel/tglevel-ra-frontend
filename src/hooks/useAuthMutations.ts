'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { sendOtp, verifyOtp } from '@/lib/api/auth';
import type { SendOtpPayload, VerifyOtpPayload } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/errors';
import { persistSession, persistUser } from '@/lib/api/session';
import { useAppDispatch } from '@/redux/hooks';
import { setCredentials } from '@/redux/slices/authSlice';
import type { AuthUser } from '@/redux/slices/authSlice';

export function useSendOtp() {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: SendOtpPayload) => sendOtp(payload),
    onSuccess: (result, variables) => {
      toast.success(result.message || 'OTP sent to your mobile number');
      router.push(`/auth/verify-otp?mobile=${encodeURIComponent(variables.mobileNumber)}`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useVerifyOtp() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
    onSuccess: (result) => {
      persistSession(result.accessToken);
      const user: AuthUser = {
        id: result.data.ra_id,
        name: result.data.display_name,
        phone: result.data.phone_number,
        avatarUrl: result.data.profile_picture,
        assignedCommunities: result.data.assigned_communities,
      };
      persistUser(user);
      dispatch(setCredentials({ token: result.accessToken, user }));
      toast.success(result.message || 'Logged in successfully');
      router.push('/dashboard');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

// Standalone resend (no navigation) for the OTP screen's resend action.
export function useResendOtp() {
  return useMutation({
    mutationFn: (payload: SendOtpPayload) => sendOtp(payload),
    onSuccess: (result) => toast.success(result.message || 'A new OTP has been sent'),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
