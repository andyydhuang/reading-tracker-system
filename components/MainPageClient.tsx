// components/MainPageClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { HeroSection } from "./HeroSection";
import { AuthModal } from "./AuthModal";
import { BookCategories } from "./BookCategories";
import { LoginCard } from "./LoginCard";
import { useAuth } from '../context/AuthContext';

export function MainPageClient() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      console.log("MainPageClient: User is logged in, redirecting to /home");
      router.replace("/home");
    }
  }, [currentUser, isAuthLoading, router]);

  const openSignUp = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f7f1]">
        <p className="text-gray-600">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f9f7f1]">
      <main className="flex-1">
        <HeroSection onReadMore={openSignUp} />
        <div className="absolute top-5 right-5">
          <LoginCard />
        </div>
        <BookCategories isLoggedIn={!!currentUser} />
      </main>
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onToggleMode={() =>
            setAuthMode(authMode === "signin" ? "signup" : "signin")
          }
          onSignUpWithEmail={() => setShowAuthModal(false)}
        />
      )}
      <footer className="py-6 text-center text-sm text-gray-600 border-t border-gray-200">
        © 2025 Yi-Ta Huang
      </footer>
    </div>
  );
}