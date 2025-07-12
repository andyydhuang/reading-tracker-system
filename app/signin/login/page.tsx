// app/signin/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";

export default function SignInWithEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        console.error("Supabase sign-in error:", error);
      } else if (data.user) {
        console.log("User signed in:", data.user);
        router.push("/home"); // Redirect to home page after successful sign-in
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
      console.error("Unexpected error during sign-in:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/signup"); // Redirect to sign-up page
  };

  return (
    <div className="min-h-screen bg-[#f9f7f1] flex flex-col items-center pt-12">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md mx-4">
        <h1 className="text-3xl font-serif text-center text-[#382110] mb-8">
          Sign in
        </h1>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#382110]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#382110]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/*
            <Link href="/password-assistance" className="text-[#00635d] hover:underline text-sm mt-1 block text-right">
              Password assistance
            </Link>
            */}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#382110] text-white hover:bg-[#58371F] rounded font-medium"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="relative my-8">
          <hr className="border-gray-300" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-500 text-sm whitespace-nowrap">
            New to YH Reading Tracker?
          </span>
        </div>

        <button
          onClick={handleSignUpClick}
          className="w-full py-2 px-4 border border-gray-300 rounded text-[#111111] hover:bg-gray-50 font-medium"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}