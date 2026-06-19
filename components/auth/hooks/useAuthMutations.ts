'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { sendOtp, verifyOtp } from '@/components/auth/services/auth.service';
import type { SendOtpPayload, VerifyOtpPayload } from '@/components/auth/services/auth.service';
import { getApiErrorMessage } from '@/lib/errors/api-error';
import { persistSession, persistUser } from '@/services/session';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import type { AuthUser } from '@/store/slices/authSlice';

export function useSendOtp() {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: SendOtpPayload) => sendOtp(payload),
    onSuccess: (result, variables) => {
      toast.success(result.message || 'OTP sent to your mobile number');
      router.push(`/verify-otp?mobile=${encodeURIComponent(variables.mobileNumber)}`);
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
        // Coalesce a possible null to undefined so it never reaches avatarUrl
        // (typed string | undefined) or the avatar UI's initials fallback.
        avatarUrl: result.data.profile || result.data.profile_picture || undefined,
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
