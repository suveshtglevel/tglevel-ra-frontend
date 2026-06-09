'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Smartphone, Lock, ChevronRight, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import { useSendOtp } from '@/modules/auth/hooks/useAuthMutations';
import { getApiFieldErrors } from '@/lib/errors/api-error';

const loginSchema = z.object({
  mobileNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(10, 'Mobile number must be 10 digits')
    .regex(/^[0-9]+$/, 'Invalid mobile number'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const callSendOtp = useSendOtp();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobileNumber: '' },
  });

  function onSubmit(values: LoginFormValues) {
    callSendOtp.mutate(
      { mobileNumber: values.mobileNumber },
      {
        // Surface any backend field-level validation (e.g. "number not
        // registered") inline on the input, in addition to the hook's toast.
        onError: (error) => {
          const fieldErrors = getApiFieldErrors(error);
          if (fieldErrors.mobileNumber) {
            form.setError('mobileNumber', { message: fieldErrors.mobileNumber });
          }
        },
      }
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-[420px] p-8 lg:p-10 xl:p-12 shadow-[0px_10px_40px_rgba(0,0,0,0.02)] border-none rounded-[32px] bg-white">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-[32px] font-bold text-[#0F172A] mb-2.5">Welcome Back</h2>
          <p className="text-slate-500 text-sm lg:text-base">Enter your registered mobile number to continue</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3 block">
                    Mobile Number
                  </FormLabel>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <FormControl>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          maxLength={10}
                          placeholder="Enter mobile number"
                          className="pl-12 h-[52px] bg-[#F1F3FF] border-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/10 text-base font-medium placeholder:text-slate-300 transition-all"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                          onKeyDown={(e) => {
                            // Block non-numeric character keys (allow control/navigation keys).
                            if (
                              e.key.length === 1 &&
                              !/[0-9]/.test(e.key) &&
                              !e.ctrlKey &&
                              !e.metaKey
                            ) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage className="text-xs text-red-500 font-medium ml-2" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={callSendOtp.isPending}
              className="w-full h-[60px] bg-[#042F23] hover:bg-[#03241b] text-white rounded-xl text-base font-bold transition-all duration-300 group flex items-center justify-center gap-2 shadow-lg shadow-[#042F23]/10 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {callSendOtp.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending OTP…
                </>
              ) : (
                <>
                  Send OTP
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
