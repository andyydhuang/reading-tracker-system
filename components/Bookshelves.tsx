// components/Bookshelves.tsx
import React from 'react';
import Link from 'next/link';

interface ShelfItem {
  name: string;
  count: number;
  type: string;
}

interface BookshelvesProps {
  shelves: ShelfItem[];
}


export function Bookshelves({ shelves }: BookshelvesProps) {
  if (!shelves || !Array.isArray(shelves) || shelves.length === 0) {
    console.warn("Bookshelves component received invalid or empty 'shelves' prop:", shelves);
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">BOOKSHELVES</h2>
        <p className="text-gray-500">No bookshelves to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">BOOKSHELVES</h2>
      <ul className="space-y-3">
        {shelves.map((shelf) => (
          <li key={shelf.type}>
            <Link
              href={`/my-books?shelf=${shelf.type}`}
              className="flex items-center justify-between text-gray-700 hover:text-gray-900"
            >
              <span>{shelf.name}</span>
              <span className="text-gray-500">{shelf.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}