'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Lock, ChevronRight, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import { useVerifyOtp, useResendOtp } from '@/modules/auth/hooks/useAuthMutations';

const RESEND_SECONDS = 30;

const otpSchema = z.object({
  otp: z.string().length(4, 'OTP must be 4 digits').regex(/^[0-9]+$/, 'OTP must be numeric'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const mobileNumber = searchParams.get('mobile') ?? '';

  const callVerifyOtp = useVerifyOtp();
  const callResendOtp = useResendOtp();

  const [timer, setTimer] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  function onSubmit(values: OtpFormValues) {
    callVerifyOtp.mutate({ mobileNumber, otp: values.otp });
  }

  function handleResend() {
    callResendOtp.mutate(
      { mobileNumber },
      { onSuccess: () => setTimer(RESEND_SECONDS) }
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-[420px] p-8 lg:p-10 xl:p-12 shadow-[0px_10px_40px_rgba(0,0,0,0.02)] border-none rounded-[32px] bg-white">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-[32px] font-bold text-[#0F172A] mb-2.5">Verify OTP</h2>
          <p className="text-slate-500 text-sm lg:text-base">Enter the code sent to your mobile number</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-4 block">
                    VERIFICATION CODE
                  </FormLabel>
                  <div role="group" aria-label="Verification code" className="flex justify-between gap-3">
                    {[0, 1, 2, 3].map((index) => {
                      const digit = (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          aria-label={`Digit ${index + 1}`}
                          maxLength={1}
                          className="w-full h-16 sm:h-20 bg-[#F1F3FF] border-none rounded-[16px] sm:rounded-[20px] text-center text-2xl sm:text-3xl font-bold text-[#0F172A] focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                          value={field.value[index] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^[0-9]$/.test(val) || val === '') {
                              const currentOtp = field.value.split('');
                              currentOtp[index] = val;
                              const newOtp = currentOtp.join('');
                              field.onChange(newOtp);
                              if (val && e.target.nextSibling) {
                                (e.target.nextSibling as HTMLInputElement).focus();
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !field.value[index] && e.currentTarget.previousSibling) {
                              (e.currentTarget.previousSibling as HTMLInputElement).focus();
                            }
                          }}
                        />
                      );
                      // Bind the form control (id/aria) to the first box so FormLabel's htmlFor targets a real input.
                      return index === 0 ? <FormControl key={index}>{digit}</FormControl> : digit;
                    })}
                  </div>
                  <FormMessage className="text-xs text-red-500 font-medium ml-2" />
                </FormItem>
              )}
            />

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm font-semibold text-slate-600">
                  Resend Code in <span className="text-slate-900">{formatTime(timer)}</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={callResendOtp.isPending}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {callResendOtp.isPending ? 'Resending…' : 'Resend Code'}
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={callVerifyOtp.isPending}
              className="w-full h-[60px] bg-[#042F23] hover:bg-[#03241b] text-white rounded-xl text-base font-bold transition-all duration-300 group flex items-center justify-center gap-2 shadow-lg shadow-[#042F23]/10 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {callVerifyOtp.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  Verify &amp; Login
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-12 flex flex-col items-center gap-8">
          <div className="w-full h-[1px] bg-slate-100/60" />
          <div className="flex items-center gap-2 bg-[#E8F5F1] px-6 py-2.5 rounded-full border border-[#D1E9E2]">
            <Lock className="w-4 h-4 text-[#06322C]" />
            <span className="text-[12px] font-semibold text-[#06322C]">Secure Bank-Grade Authentication</span>
          </div>
        </div>
      </Card>
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
          <span className="h-9 w-9 rounded-full border-[3px] border-slate-200 border-t-emerald-500 animate-spin" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
