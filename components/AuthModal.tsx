//components/AuthModal.tsx

import React from 'react';
import { X as CloseIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  mode: 'signin' | 'signup';
  onClose: () => void;
  onToggleMode: () => void;
  onSignUpWithEmail: () => void;
}

export function AuthModal({
  mode,
  onClose,
  onToggleMode,
  onSignUpWithEmail
}: AuthModalProps) {
  const router = useRouter();
  const title = mode === 'signin' ? 'Sign in to YH Reading Tracker' : 'Discover & read more';

  const handleSignUpClick = () => {
    console.log('Sign up button clicked');
    onSignUpWithEmail();
  };

  const handleSignInClick = () => {
    console.log('Sign in button clicked');
    onClose();
    router.push('/home');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
          <CloseIcon size={20} />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-[#382110] mb-6">
            {title}
          </h2>
          <div className="space-y-4">
            <div className="w-full relative z-10">
              <button 
                type="button"
                onClick={mode === 'signin' ? handleSignInClick : handleSignUpClick}
                className="w-full py-3 bg-[#382110] rounded text-white font-medium hover:bg-[#58371F] cursor-pointer active:bg-[#58371F] focus:outline-none focus:ring-2 focus:ring-[#382110] focus:ring-opacity-50"
              >
                Sign {mode === 'signin' ? 'in' : 'up'} with email
              </button>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">
              {mode === 'signin' ? 'Not a member?' : 'Already a member?'}{' '}
              <button onClick={onToggleMode} className="text-[#0E7C7B] hover:underline font-medium">
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}