// app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { useEffect } from 'react';
import { ApiBook, ShelfType } from '@/types/index';

const inter = Inter({ subsets: ['latin'] });


function LayoutContentInternal({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    /*
    console.log(`Layout Effect: User ID: ${user ? user.id : 'null'}`);
    console.log(`Layout Effect: IsLoading: ${isLoading}`);
    console.log(`Layout Effect: Current Pathname: ${pathname}`);
    */
  }, [user, isLoading, pathname, router]);

  const handleAddToShelf = (
    bookItem: ApiBook,
    shelfType: ShelfType
  ) => {
    if (!user) {
      console.error('User not authenticated for addToShelf action.');
      return;
    }
    console.log(
      'Attempting to add book "${bookItem.volumeInfo.title}" (ID: ${bookItem.id}) to shelf: "${shelfType}" for user ${user.id}'
    );
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      alert('Failed to sign out. Please try again.');
    } else {
      console.log('User signed out successfully from layout handleSignOut.');
    }
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header
          currentPath={pathname}
          isLoggedIn={!!user}
          userName={user?.user_metadata?.full_name || user?.email || undefined}
          onAddToShelf={handleAddToShelf}
          onSignOut={handleSignOut}
        />
        {children}
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // AuthProvider should wrap the entire content that needs access to the auth context
    <AuthProvider>
      <LayoutContentInternal>{children}</LayoutContentInternal>
    </AuthProvider>
  );
}