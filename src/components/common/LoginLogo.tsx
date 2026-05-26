import React from 'react';
import Image from 'next/image';

const LoginLogo = () => (
  <div className="relative w-[140px] h-[130px] mx-auto">
    <Image 
      src="/Logo.png" 
      alt="TG Logo" 
      fill
      className="object-contain"
      priority
    />
  </div>
);

export default LoginLogo;
