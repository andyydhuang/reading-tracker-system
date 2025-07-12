// app/signin/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('SignInPage - Component mounted');
  }, []);

  const handleEmailSignIn = () => {
    console.log('SignInPage - Navigating to /signin/login');
    router.push('/signin/login');
  };

  return (
    <div className="min-h-screen bg-[#f9f7f1] flex flex-col items-center pt-12">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md mx-4">
        <h1 className="text-3xl font-serif text-center text-[#382110] mb-8">
          Sign In
        </h1>

        <div className="space-y-4">
          <button
            onClick={handleEmailSignIn}
            className="w-full py-3 px-4 bg-[#382110] text-white hover:bg-[#58371F] rounded font-medium"
          >
            Sign in with email
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Not a member? </span>
          <Link href="/signup" className="text-[#00635d] hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
