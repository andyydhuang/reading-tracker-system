// app/page.tsx

import type { Metadata } from 'next';
import { MainPageClient } from '../components/MainPageClient';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover and share books on the platform.',
};

export default function MainPage() {
  return (
    // Render the client component that contains all your interactive logic
    <MainPageClient />
  );
}