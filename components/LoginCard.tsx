'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export function LoginCard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('LoginCard - Current pathname:', pathname);
  }, [pathname]);

  console.log('LoginCard - Rendering component');

  const handleSignUpClick = () => {
    console.log('LoginCard - Navigating to sign up page');
    router.push('/signup');
  };

  return (
    <div className="w-80 p-6 mx-auto bg-[#fffaf2] rounded-xl shadow-md text-center font-sans">
      <h2 className="text-xl mb-5 font-semibold">Discover & read more</h2>

      <button 
        className="w-full py-2 px-3 mb-3 text-base rounded-lg cursor-pointer flex items-center justify-center bg-[#3e2f2f] text-white"
        onClick={handleSignUpClick}
      >
        Sign up with email
      </button>

      <p className="text-sm mt-2">
        Already a member?{' '}
        <Link href="/signin" className="text-[#00635d] hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
