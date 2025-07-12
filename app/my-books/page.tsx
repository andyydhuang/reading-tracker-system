// app/my-books/page.tsx

import { createClient as supabaseServer } from "@/utils/supabase/server";
import MyBooksClientPage from '@/components/MyBooksClientPage';
import { updateShelfAction, updateReviewAction } from '@/app/my-books/actions';

interface ShelfItem {
    name: string;
    count: number;
    type: string;
}

export interface ShelfBook {
    id: string;
    user_id: string;
    book_id: string;
    shelf_type: 'read' | 'currently_reading' | 'want_to_read' | 'removed';
    date_added: string;
    date_started: string | null;
    date_finished: string | null;
    review_id: string | null;
    review_data: {
        id: string;
        rating: number | null;
        review_text: string | null;
        created_at: string;
        updated_at: string | null;
    } | null;
    volumeInfo: {
        id: string;
        title: string;
        authors: string[] | null;
        description: string | null;
        publisher: string | null;
        publishedDate: string | null;
        imageLinks: {
            thumbnail: string | null;
            smallThumbnail: string | null;
        } | null;
        previewLink: string | null;
        infoLink: string | null;
    };
}


interface RawShelfBookData {
    id: string;
    user_id: string;
    book_id: string;
    shelf_type: 'read' | 'currently_reading' | 'want_to_read' | 'removed';
    date_added: string;
    date_started: string | null;
    date_finished: string | null;
    review_id: string | null;

    reviews: {
        id: string;
        rating: number | null;
        review_text: string | null;
        created_at: string;
        updated_at: string | null;
    } | null;

    books: {
        id: string;
        google_books_id: string;
        title: string;
        authors: string[] | null;
        cover_image_url: string | null;
        publisher: string | null;
        publication_date: string | null;
        description: string | null;
        image_small_thumbnail_url: string | null;
        preview_link: string | null;
        info_link: string | null;
    } | null;
}

const SHELF_DISPLAY_NAMES: { [key: string]: string } = {
    'read': 'Read',
    'currently_reading': 'Currently Reading',
    'want_to_read': 'Want to Read',
    'removed': 'Removed',
};


export default async function MyBooksPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const supabase = supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();

    let shelfbooks: ShelfBook[] = [];

    if (user) {
        //console.log(`Fetching bookshelves for user: ${user.id}`);
        const { data, error } = await supabase
            .from('bookshelves')
            .select(`
                id,
                user_id,
                book_id,
                shelf_type,
                date_added,
                date_started,
                date_finished,
                review_id,
                reviews!fk_review(id, rating, review_text, created_at, updated_at),
                books!bookshelves_book_id_fkey(
                    id,
                    google_books_id,
                    title,
                    authors,
                    cover_image_url,
                    publisher,
                    publication_date,
                    description,
                    image_small_thumbnail_url,
                    preview_link,
                    info_link
                )
            `)
            .eq('user_id', user.id)
            .neq('shelf_type', 'removed')
            .order('date_added', { ascending: false });

        if (error) {
            console.error('Error fetching bookshelves:', error.message);
        } else if (data) {
            //console.log(`Fetched ${data.length} bookshelf entries.`);
            const rawData: RawShelfBookData[] | null = data as RawShelfBookData[] | null;

            if (rawData) {
                shelfbooks = rawData
                    .filter((item): item is RawShelfBookData => item.books !== null)
                    .map((item: RawShelfBookData) => {
                        const book = item.books!;
                        const review = item.reviews;

                        return {
                            id: item.id,
                            user_id: item.user_id,
                            book_id: item.book_id,
                            shelf_type: item.shelf_type,
                            date_added: item.date_added,
                            date_started: item.date_started,
                            date_finished: item.date_finished,
                            review_id: item.review_id,
                            review_data: review ? {
                                id: review.id,
                                rating: review.rating,
                                review_text: review.review_text,
                                created_at: review.created_at,
                                updated_at: review.updated_at,
                            } : null,
                            volumeInfo: {
                                id: book.google_books_id,
                                title: book.title,
                                authors: book.authors,
                                description: book.description,
                                publisher: book.publisher,
                                publishedDate: book.publication_date,
                                imageLinks: {
                                    thumbnail: book.cover_image_url,
                                    smallThumbnail: book.image_small_thumbnail_url,
                                },
                                previewLink: book.preview_link,
                                infoLink: book.info_link,
                            },
                        };
                    });
            }
        }
    } else {
        console.log('User not logged in. No bookshelves to fetch.');
    }

    const shelfCountsMap = shelfbooks.reduce((acc, book) => {
        acc[book.shelf_type] = (acc[book.shelf_type] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    const shelfCountsArray: ShelfItem[] = [
        { name: 'All Books', count: shelfbooks.length, type: 'all' },
        { name: 'Want to Read', count: shelfCountsMap['want_to_read'] || 0, type: 'want_to_read' },
        { name: 'Currently Reading', count: shelfCountsMap['currently_reading'] || 0, type: 'currently_reading' },
        { name: 'Read', count: shelfCountsMap['read'] || 0, type: 'read' },
    ].filter(shelf => SHELF_DISPLAY_NAMES[shelf.type] !== 'Removed');

    shelfCountsArray.sort((a, b) => {
        const order = ['all', 'want_to_read', 'currently_reading', 'read'];
        return order.indexOf(a.type) - order.indexOf(b.type);
    });

    const initialSelectedShelf = typeof searchParams?.shelf === 'string' ? searchParams.shelf : 'all';

    return (
        <MyBooksClientPage
            initialBooks={shelfbooks}
            shelfCounts={shelfCountsArray}
            initialSelectedShelf={initialSelectedShelf}
            onUpdateShelf={updateShelfAction}
            onUpdateRating={updateReviewAction}
        />
    );
}