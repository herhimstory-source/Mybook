import React from 'react';
import { Book, Quote } from '../types';
import StarRating from './StarRating';
import { PencilIcon, TrashIcon, PlusIcon, ArrowLeftIcon } from './icons';

interface QuoteListProps {
  quotes: Quote[];
  onEditQuote: (quote: Quote) => void;
  onDeleteQuote: (quoteId: string) => void;
}

const QuoteList: React.FC<QuoteListProps> = ({ quotes, onEditQuote, onDeleteQuote }) => {
  if (quotes.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400 mt-4">아직 추가된 글귀가 없습니다.</p>;
  }
  return (
    <div className="space-y-4 mt-4">
      {quotes.map((quote) => (
        <div key={quote.id} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg relative group">
          <blockquote className="text-slate-700 dark:text-slate-300 italic border-l-4 border-sky-500 pl-4">
            {quote.text}
          </blockquote>
          {quote.page && <p className="text-right text-sm text-slate-500 dark:text-slate-400 mt-2">p. {quote.page}</p>}
          <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEditQuote(quote)} className="text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"><PencilIcon className="w-4 h-4"/></button>
            <button onClick={() => onDeleteQuote(quote.id)} className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface BookDetailProps {
  book: Book;
  onBack: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
  onAddQuote: (bookId: string) => void;
  onEditQuote: (bookId: string, quote: Quote) => void;
  onDeleteQuote: (bookId: string, quoteId: string) => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ book, onBack, onEditBook, onDeleteBook, onAddQuote, onEditQuote, onDeleteQuote }) => {

  const handleDelete = () => {
    onDeleteBook(book);
  }

  const sortedQuotes = [...book.quotes].sort((a, b) => {
    const pageAStr = String(a.page).trim();
    const pageBStr = String(b.page).trim();

    if (pageAStr === '' && pageBStr === '') return 0;
    if (pageAStr === '') return 1;
    if (pageBStr === '') return -1;

    const pageANum = parseInt(pageAStr, 10);
    const pageBNum = parseInt(pageBStr, 10);

    const aIsNaN = isNaN(pageANum);
    const bIsNaN = isNaN(pageBNum);

    if (aIsNaN && bIsNaN) {
      return pageAStr.localeCompare(pageBStr);
    }
    if (aIsNaN) return 1;
    if (bIsNaN) return -1;

    return pageANum - pageBNum;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <button onClick={onBack} className="flex items-center text-sm font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 mb-6">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            서재로 돌아가기
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden">
            <div className="md:flex">
                <div className="md:flex-shrink-0">
                    <img className="h-64 w-full object-cover sm:h-80 md:h-full md:w-64" src={book.coverImage} alt={book.title} />
                </div>
                <div className="p-4 sm:p-6 md:p-8 flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="uppercase tracking-wide text-sm text-sky-500 dark:text-sky-400 font-semibold">{book.genre}</div>
                            <h1 className="block mt-1 text-2xl sm:text-3xl leading-tight font-bold text-black dark:text-white">{book.title}</h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-300 text-lg">{book.author}</p>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                            <button onClick={() => onEditBook(book)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><PencilIcon /></button>
                            <button onClick={handleDelete} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><TrashIcon /></button>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <StarRating rating={book.rating} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center text-sm text-slate-500 dark:text-slate-400 gap-x-4 gap-y-2">
                        {book.pageCount > 0 && <span>총 {book.pageCount} 페이지</span>}
                        {book.completionDate && (
                            <span className={book.pageCount > 0 ? "border-l border-slate-300 dark:border-slate-600 pl-4" : ""}>
                                완독: {book.completionDate}
                            </span>
                        )}
                    </div>

                    <p className="mt-6 text-slate-500 dark:text-slate-300 whitespace-pre-wrap">{book.summary || "작성된 요약이 없습니다."}</p>
                </div>
            </div>
            <div className="px-4 py-6 sm:px-8 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-700">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">인상 깊은 글귀</h2>
                    <button 
                        onClick={() => onAddQuote(book.id)}
                        className="flex items-center text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded-md"
                    >
                        <PlusIcon className="w-5 h-5 mr-1" />
                        글귀 추가
                    </button>
                </div>
                <QuoteList 
                    quotes={sortedQuotes} 
                    onEditQuote={(quote) => onEditQuote(book.id, quote)}
                    onDeleteQuote={(quoteId) => onDeleteQuote(book.id, quoteId)}
                />
            </div>
        </div>
    </div>
  );
};

export default BookDetail;