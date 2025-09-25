export interface Quote {
  id: string;
  text: string;
  page: number | string;
}

export interface Book {
  id:string;
  title: string;
  author: string;
  isbn?: string;
  genre: string;
  coverImage: string;
  rating: number;
  summary: string;
  quotes: Quote[];
  pageCount: number;
  completionDate?: string;
}

export type ModalState =
  | { type: 'add-book' }
  | { type: 'edit-book'; book: Book }
  | { type: 'add-quote'; bookId: string }
  | { type: 'edit-quote'; bookId: string; quote: Quote }
  | { type: 'delete-book-confirm'; book: Book }
  | null;