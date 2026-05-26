'use client';

import React from 'react';
import LoginLogo from '@/components/common/LoginLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row overflow-hidden bg-white">
      {/* Left Section - Hero (Shared) */}
      <div 
        className="relative flex flex-col lg:w-[40%] xl:w-[576px] lg:min-h-screen w-full text-[#124150]"
        style={{
          background: 'linear-gradient(184.12deg, #FFFFFF -2.03%, #E1EFE1 -2.02%, #AAD3AA 48.77%, #6DBC8F 96.97%)',
        }}
      >
        <div className="flex flex-col h-full px-8 py-12 lg:px-12 xl:px-[72px] lg:pt-20 xl:pt-28 lg:pb-12">
          <div className="mb-8 lg:mb-12 xl:mb-16">
            <LoginLogo />
          </div>
          
          <div className="max-w-md">
            <h1 className="text-4xl lg:text-[44px] xl:text-[54px] font-bold mb-8 leading-[1.05] tracking-tight text-[#124150]">
              Research <br />
              Analyst Panel
            </h1>
            <p className="text-[#124150]/65 text-lg lg:text-xl leading-[1.6] max-w-[340px] font-normal">
              Securely manage trade alerts, subscribers, and research operations with institutional-grade tools.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Content Container (Shared) */}
      <div 
        className="flex flex-col flex-1 lg:min-h-screen w-full items-center justify-between bg-[#F9F9FF]"
        style={{
          padding: '0 40px 32px 40px'
        }}
      >
        <div className="flex-1 flex items-center justify-center w-full scale-[0.85] xl:scale-[0.9] transition-transform origin-center">
          {children}
        </div>
        
        <p className="text-center text-slate-400 text-sm font-medium tracking-wide">
          © 2026 TGLevels Research Platform
        </p>
      </div>
    </div>
  );
}
