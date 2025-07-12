// signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    reenterPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { name, email, password, reenterPassword } = formData;

    if (!name || !email || !password || !reenterPassword) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (password !== reenterPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    // Add checks for lowercase, uppercase, and digits
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);

    if (!hasLowercase || !hasUppercase || !hasDigit) {
      setError("Password must include lowercase letters, uppercase letters, and digits.");
      setLoading(false);
      return;
    }

    try {
      // Supabase sign-up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setError(error.message);
        console.error("Supabase sign-up error:", error);
      } else if (data.user) {
        alert("Account created successfully! Please check your email for a confirmation link if required.");
        router.push("/signin");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
      console.error("Unexpected error during sign-up:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/signin");
  };

  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-screen bg-white">
      {/* Sign Up Form */}
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-serif mb-8 text-center">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your name
            </label>
            <input
              type="text"
              id="name"
              placeholder="First and last name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              placeholder="At least 6 chars, with lowercase, uppercase, and digits"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Passwords must be at least 6 characters and include lowercase letters, uppercase letters, and digits.
            </p>
          </div>

          <div>
            <label htmlFor="reenterPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Re-enter password
            </label>
            <input
              type="password"
              id="reenterPassword"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.reenterPassword}
              onChange={(e) => setFormData({ ...formData, reenterPassword: e.target.value })}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#382110] text-white rounded-md hover:bg-[#58371F]"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          Already have an account?{" "}
          <a href="#" onClick={handleSignInClick} className="text-[#382110] underline">
            Sign in
          </a>
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-8 pb-4 text-center">
        <p className="text-sm text-gray-500">© 2025 Yi-TA Huang</p>
      </footer>
    </div>
  );
}