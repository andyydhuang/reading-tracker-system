// app/home/page.tsx
import type { Metadata } from 'next';
import HomePageClient from '../../components/HomePageClient';
import { createClient as supabaseServer } from "@/utils/supabase/server";

interface ShelfItem {
    name: string;
    count: number;
    type: string;
}

export const metadata: Metadata = {
  title: 'Home',
  description: 'View user\'s personal bookshelves, currently reading, and discover books.',
};

const SHELF_DISPLAY_NAMES: { [key: string]: string } = {
    'read': 'Read',
    'currently_reading': 'Currently Reading',
    'want_to_read': 'Want to Read',
    'removed': 'Removed',
    'all': 'All Books',
};

export default async function HomePage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let shelfbooksCount = 0;
  const shelfCountsMap: { [key: string]: number } = {};

  if (user) {
    //console.log(`[HomePage] Fetching bookshelves for user: ${user.id}`);
    const { data, error } = await supabase
      .from('bookshelves')
      .select('shelf_type')
      .eq('user_id', user.id)
      .neq('shelf_type', 'removed');

    if (error) {
      console.error('[HomePage] Error fetching bookshelves for counts:', error.message);
    } else if (data) {
      shelfbooksCount = data.length;
      data.forEach(entry => {
        shelfCountsMap[entry.shelf_type] = (shelfCountsMap[entry.shelf_type] || 0) + 1;
      });
    }
  } else {
    console.log('[HomePage] User not logged in. No bookshelves counts to fetch.');
  }

  const shelfCountsArray: ShelfItem[] = [
      { name: SHELF_DISPLAY_NAMES['all'], count: shelfbooksCount, type: 'all' },
      { name: SHELF_DISPLAY_NAMES['want_to_read'], count: shelfCountsMap['want_to_read'] || 0, type: 'want_to_read' },
      { name: SHELF_DISPLAY_NAMES['currently_reading'], count: shelfCountsMap['currently_reading'] || 0, type: 'currently_reading' },
      { name: SHELF_DISPLAY_NAMES['read'], count: shelfCountsMap['read'] || 0, type: 'read' },
  ];

  // Sort the shelves for display order
  shelfCountsArray.sort((a, b) => {
      const order = ['all', 'want_to_read', 'currently_reading', 'read'];
      return order.indexOf(a.type) - order.indexOf(b.type);
  });

  return (
    <HomePageClient shelfCounts={shelfCountsArray} />
  );
}