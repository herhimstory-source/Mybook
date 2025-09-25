import { Book } from '../types';

export interface FetchedBookData {
  title: string;
  author: string;
  pageCount: number;
  coverImage?: string;
}

export const fetchBookByISBN = async (isbn: string): Promise<FetchedBookData | null> => {
  if (!isbn) return null;
  
  const formattedIsbn = isbn.replace(/-/g, '').trim();
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${formattedIsbn}&jscmd=data&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch from Open Library API with status:", response.status);
      return null;
    }
    const data = await response.json();
    const bookData = data[`ISBN:${formattedIsbn}`];

    if (!bookData) {
      return null; // Book not found
    }

    const title = bookData.title;
    const author = bookData.authors ? bookData.authors.map((a: { name: string }) => a.name).join(', ') : '저자 정보 없음';
    const pageCount = bookData.number_of_pages || 0;
    const coverImage = bookData.cover ? bookData.cover.large || bookData.cover.medium || bookData.cover.small : undefined;

    return { title, author, pageCount, coverImage };
  } catch (error) {
    console.error("Error fetching book by ISBN:", error);
    return null;
  }
};