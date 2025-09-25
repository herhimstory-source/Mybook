import React, { useState, useEffect, useMemo } from 'react';
import { Book, Quote } from '../types';
import { PlusIcon, SearchIcon } from './icons';
import StarRating from './StarRating';
import Pagination from './Pagination';

interface BookListProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onAddBook: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchType: 'title' | 'author' | 'quote';
  setSearchType: (type: 'title' | 'author' | 'quote') => void;
}

const BookItem: React.FC<{ book: Book; onSelectBook: (book: Book) => void }> = ({ book, onSelectBook }) => (
  <div
    onClick={() => onSelectBook(book)}
    className="group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-slate-800 flex flex-col h-full"
    role="button"
    aria-label={`View details for ${book.title}`}
  >
    <div className="relative">
      <img src={book.coverImage} alt={book.title} className="w-full h-64 object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 transition-all"></div>
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{book.title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 truncate">{book.author}</p>
      <div className="mt-auto pt-2">
        <StarRating rating={book.rating} size="sm" />
      </div>
    </div>
  </div>
);

const AddBookCard: React.FC<{ onAddBook: () => void }> = ({ onAddBook }) => (
  <div
    onClick={onAddBook}
    className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-300 flex flex-col justify-center items-center text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-500 min-h-[344px] h-full"
    role="button"
    aria-label="Add a new book"
  >
    <PlusIcon className="w-12 h-12" />
    <span className="mt-2 font-semibold">새 책 추가하기</span>
  </div>
);

// New component for quote search results
interface QuoteSearchResult {
  quote: Quote;
  book: Book;
}

const QuoteSearchResultItem: React.FC<{ result: QuoteSearchResult; onSelectBook: (book: Book) => void }> = ({ result, onSelectBook }) => {
  const { quote, book } = result;
  return (
    <div 
      onClick={() => onSelectBook(book)} 
      className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md hover:shadow-xl dark:hover:shadow-slate-700/50 transition-shadow cursor-pointer border border-gray-200 dark:border-slate-700"
      role="button"
      aria-label={`View details for ${book.title}, quote: ${quote.text}`}
    >
      <blockquote className="text-slate-700 dark:text-slate-300 italic border-l-4 border-sky-500 pl-4 mb-3">
        "{quote.text}"
      </blockquote>
      <div className="text-right text-sm mt-4">
        <p className="font-bold text-slate-800 dark:text-slate-100">{book.title}</p>
        <p className="text-slate-600 dark:text-slate-400">{book.author}</p>
        {quote.page && <p className="text-slate-500 dark:text-slate-500 mt-1">p. {quote.page}</p>}
      </div>
    </div>
  );
};


const BookList: React.FC<BookListProps> = ({ books, onSelectBook, onAddBook, searchQuery, setSearchQuery, searchType, setSearchType }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const BOOKS_PER_PAGE = 9;
  const QUOTES_PER_PAGE = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchType]);
  
  const searchTypes = [
    { key: 'title', label: '서명' },
    { key: 'author', label: '저자' },
    { key: 'quote', label: '글귀' },
  ];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(e.currentTarget.value);
    }
  };

  const filteredResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return { type: 'books', data: books };
    }

    if (searchType === 'quote') {
      const quoteData: QuoteSearchResult[] = [];
      books.forEach(book => {
        book.quotes.forEach(quote => {
          if (quote.text.toLowerCase().includes(query)) {
            quoteData.push({ quote, book });
          }
        });
      });
      return { type: 'quotes', data: quoteData };
    }

    const bookData = books.filter(book => {
      if (searchType === 'title') {
        return book.title.toLowerCase().includes(query);
      }
      if (searchType === 'author') {
        return book.author.toLowerCase().includes(query);
      }
      return false;
    });
    return { type: 'books', data: bookData };
  }, [books, searchQuery, searchType]);


  const renderContent = () => {
    const query = searchQuery.toLowerCase().trim();

    if (filteredResults.type === 'quotes') {
      const quoteSearchResults = filteredResults.data as QuoteSearchResult[];

      if (quoteSearchResults.length === 0) {
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">검색 결과가 없습니다.</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">다른 검색어로 다시 시도해보세요.</p>
          </div>
        );
      }
      
      const totalPages = Math.ceil(quoteSearchResults.length / QUOTES_PER_PAGE);
      const paginatedResults = quoteSearchResults.slice(
        (currentPage - 1) * QUOTES_PER_PAGE,
        currentPage * QUOTES_PER_PAGE
      );

      return (
        <>
          <div className="space-y-4 max-w-4xl mx-auto">
            {paginatedResults.map((result, index) => (
              <QuoteSearchResultItem key={`${result.book.id}-${result.quote.id}-${index}`} result={result} onSelectBook={onSelectBook} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      );
    }
    
    const currentBooks = filteredResults.data as Book[];

    if (currentBooks.length === 0) {
      return query ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">검색 결과가 없습니다.</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">다른 검색어로 다시 시도해보세요.</p>
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">서재가 비어있습니다.</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">첫 번째 책을 추가하여 당신의 독서 여정을 시작하세요.</p>
          <button
            onClick={onAddBook}
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            새 책 추가하기
          </button>
        </div>
      );
    }
    
    const gridItems: (Book | { type: 'add-card' })[] = !query
        ? [...currentBooks, { type: 'add-card' }]
        : currentBooks;

    const totalPages = Math.ceil(gridItems.length / BOOKS_PER_PAGE);
    const paginatedItems = gridItems.slice(
        (currentPage - 1) * BOOKS_PER_PAGE,
        currentPage * BOOKS_PER_PAGE
    );

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {paginatedItems.map((item) => {
                    if ('type' in item && item.type === 'add-card') {
                        return <AddBookCard key="add-card" onAddBook={onAddBook} />;
                    }
                    const book = item as Book;
                    return <BookItem key={book.id} book={book} onSelectBook={onSelectBook} />;
                })}
            </div>
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="서재에서 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            aria-label="Search books"
          />
        </div>
        <div className="flex justify-center items-center space-x-2 sm:space-x-4 mt-4" role="radiogroup" aria-labelledby="search-by-label">
          <span id="search-by-label" className="text-sm font-medium text-gray-600 dark:text-gray-400">검색 기준:</span>
          {searchTypes.map(type => (
            <label key={type.key} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
              <input
                type="radio"
                name="searchType"
                value={type.key}
                checked={searchType === type.key}
                onChange={() => setSearchType(type.key as 'title' | 'author' | 'quote')}
                className="h-4 w-4 text-sky-600 border-gray-300 dark:border-slate-600 focus:ring-sky-500 dark:bg-slate-700 dark:checked:bg-sky-600 dark:checked:border-transparent"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default BookList;