// components/MyBooksClientPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import MyBooksTable from './MyBooksTable';
import { ShelfBook } from '@/app/my-books/page';
import { Bookshelves } from './Bookshelves';

import { GoogleBookDetailsForDB, ActionResponse } from '@/types/index';

interface ShelfItem {
  name: string;
  count: number;
  type: string;
}

interface MyBooksClientPageProps {
    initialBooks: ShelfBook[];
    shelfCounts: ShelfItem[];
    initialSelectedShelf: string | null;
    onUpdateShelf: (
        bookshelfEntryId: string | null,
        newShelfType: string,
        bookIdentifier: string | null,
        bookDetails?: GoogleBookDetailsForDB
    ) => Promise<ActionResponse>;
    onUpdateRating: (bookId: string, reviewText: string | null, rating: number | null, bookshelfEntryId: string) => Promise<ActionResponse>;
}

const MyBooksClientPage: React.FC<MyBooksClientPageProps> = ({
    initialBooks,
    shelfCounts,
    initialSelectedShelf,
    onUpdateShelf,
    onUpdateRating,
}) => {
    const [books, setBooks] = useState<ShelfBook[]>(initialBooks);
    const [selectedShelf, setSelectedShelf] = useState(initialSelectedShelf || 'all');

    useEffect(() => {
        setBooks(initialBooks);
        if (initialSelectedShelf !== null && initialSelectedShelf !== selectedShelf) {
            setSelectedShelf(initialSelectedShelf);
        }
    }, [initialBooks, initialSelectedShelf]);

    const filteredBooks = selectedShelf === 'all'
        ? books
        : books.filter(book => book.shelf_type === selectedShelf);

    return (
        <div className="flex flex-col lg:flex-row container mx-auto p-4 gap-6">
            <div className="lg:w-1/4 w-full">
                <Bookshelves shelves={shelfCounts} />
            </div>

            <div className="lg:w-3/4 w-full">
                <h1 className="text-2xl font-bold mb-4">My Books</h1>
                <p className="mb-4">**{shelfCounts.find(s => s.type === selectedShelf)?.name || 'All Books'}**</p>

                <MyBooksTable
                    books={filteredBooks}
                    onUpdateShelf={onUpdateShelf}
                    onUpdateRating={onUpdateRating}
                />
            </div>
        </div>
    );
};

export default MyBooksClientPage;