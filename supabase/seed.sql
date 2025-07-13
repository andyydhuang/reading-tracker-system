-- Seed data for Book Catalog application
-- This file contains initial data to populate the database

-- Insert sample genres
INSERT INTO public.genres (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Fiction', 'Imaginative literature that is not based on real events'),
('550e8400-e29b-41d4-a716-446655440002', 'Non-Fiction', 'Literature based on facts and real events'),
('550e8400-e29b-41d4-a716-446655440003', 'Science Fiction', 'Fiction dealing with futuristic science and technology'),
('550e8400-e29b-41d4-a716-446655440004', 'Fantasy', 'Fiction involving magical and supernatural elements'),
('550e8400-e29b-41d4-a716-446655440005', 'Mystery', 'Fiction involving crime and detective work'),
('550e8400-e29b-41d4-a716-446655440006', 'Romance', 'Fiction focusing on romantic relationships'),
('550e8400-e29b-41d4-a716-446655440007', 'Biography', 'Non-fiction about a person''s life'),
('550e8400-e29b-41d4-a716-446655440008', 'History', 'Non-fiction about past events'),
('550e8400-e29b-41d4-a716-446655440009', 'Self-Help', 'Non-fiction books for personal development'),
('550e8400-e29b-41d4-a716-446655440010', 'Business', 'Non-fiction about business and economics')
ON CONFLICT (id) DO NOTHING;

-- Insert sample authors
INSERT INTO public.authors (id, name, bio) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'J.R.R. Tolkien', 'English writer, poet, philologist, and university professor who is best known as the author of the classic high-fantasy works The Hobbit, The Lord of the Rings, and The Silmarillion.'),
('660e8400-e29b-41d4-a716-446655440002', 'George R.R. Martin', 'American novelist and short story writer in the fantasy, horror, and science fiction genres, screenwriter, and television producer.'),
('660e8400-e29b-41d4-a716-446655440003', 'J.K. Rowling', 'British author, philanthropist, film producer, television producer, and screenwriter. She is best known for writing the Harry Potter fantasy series.'),
('660e8400-e29b-41d4-a716-446655440004', 'Stephen King', 'American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.'),
('660e8400-e29b-41d4-a716-446655440005', 'Agatha Christie', 'English writer known for her 66 detective novels and 14 short story collections, particularly those revolving around fictional detectives Hercule Poirot and Miss Marple.')
ON CONFLICT (id) DO NOTHING;

-- Insert sample books
INSERT INTO public.books (id, title, authors, description, publisher, publication_date, page_count, language, isbn, google_books_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'The Hobbit', ARRAY['J.R.R. Tolkien'], 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep to whisk him away on an adventure.', 'Houghton Mifflin Harcourt', '1937-09-21', 366, 'en', '9780547928241', 'PJ3.R56196H6'),
('770e8400-e29b-41d4-a716-446655440002', 'The Lord of the Rings', ARRAY['J.R.R. Tolkien'], 'One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them.', 'Allen & Unwin', '1954-07-29', 1216, 'en', '9780547928210', 'PJ3.R56196L6'),
('770e8400-e29b-41d4-a716-446655440003', 'A Game of Thrones', ARRAY['George R.R. Martin'], 'In a land where summers can last decades and winters a lifetime, trouble is brewing. The cold is returning, and in the frozen wastes to the north of Winterfell, sinister and supernatural forces are massing beyond the kingdom''s protective Wall.', 'Bantam Books', '1996-08-01', 694, 'en', '9780553103540', 'YyHmswEACAAJ'),
('770e8400-e29b-41d4-a716-446655440004', 'Harry Potter and the Philosopher''s Stone', ARRAY['J.K. Rowling'], 'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. Addressed in green ink on yellowish parchment with a purple seal, they are swiftly confiscated by his grisly aunt and uncle.', 'Bloomsbury', '1997-06-26', 223, 'en', '9780747532699', 'PJ3.R56196H6'),
('770e8400-e29b-41d4-a716-446655440005', 'The Shining', ARRAY['Stephen King'], 'Jack Torrances new job at the Overlook Hotel is the perfect chance for a fresh start. As the off-season caretaker at the atmospheric old hotel, he''ll have plenty of time to spend reconnecting with his family and working on his writing.', 'Doubleday', '1977-01-28', 447, 'en', '9780385121675', 'YyHmswEACAAJ')
ON CONFLICT (id) DO NOTHING;

-- Link books to authors
INSERT INTO public.books_authors (book_id, author_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (book_id, author_id) DO NOTHING;

-- Link books to genres
INSERT INTO public.books_genres (book_id, genre_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (book_id, genre_id) DO NOTHING; 