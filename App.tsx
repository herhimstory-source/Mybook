import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Book, Quote, ModalState } from './types';
import Header from './components/Header';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import Modal from './components/Modal';
import BookForm from './components/BookForm';
import QuoteForm from './components/QuoteForm';
import { useDarkMode } from './hooks/useDarkMode';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzkDwbX-CgUzyU-3SJwLp-18RUJxf-2tQZdnxghjD7qvzApUxSKF4DMbJcFP29mwXLofw/exec';

const syncBookToSheet = async (params: {
    action: 'add' | 'update';
    bookData: {
        title: string;
        author: string;
        isbn: string;
        summary: string;
        completionDate: string;
        quotes: Quote[];
    };
    lookupIsbn?: string;
}) => {
  const { action, bookData, lookupIsbn } = params;
  const formData = new FormData();
  formData.append('action', action);
  formData.append('title', bookData.title);
  formData.append('author', bookData.author);
  formData.append('isbn', bookData.isbn);
  formData.append('summary', bookData.summary);
  formData.append('completionDate', bookData.completionDate);
  formData.append('quotes', JSON.stringify(bookData.quotes));
  
  if (action === 'update' && lookupIsbn) {
    formData.append('lookupIsbn', lookupIsbn);
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.error("Could not sync to Google Sheet", error);
    alert("책을 서재에 저장했지만, Google Sheet에 동기화하는 데 실패했습니다. 스크립트 URL과 설정을 확인해주세요.");
  }
};


function App() {
  const [books, setBooks] = useLocalStorage<Book[]>('books', []);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'author' | 'quote'>('title');
  const [theme, toggleTheme] = useDarkMode();

  // Book CRUD and Status Management
  const handleSaveBookForm = async (data: Partial<Book> & { id?: string; title: string; author: string; }) => {
    if (data.id) { // Update existing book
        const originalBook = books.find(b => b.id === data.id);
        if (!originalBook) return;

        const updatedBookData: Book = { ...originalBook, ...data };
        
        await syncBookToSheet({
          action: 'update',
          bookData: {
            title: updatedBookData.title,
            author: updatedBookData.author,
            isbn: updatedBookData.isbn || '',
            summary: updatedBookData.summary || '',
            completionDate: updatedBookData.completionDate || '',
            quotes: updatedBookData.quotes,
          },
          lookupIsbn: originalBook.isbn || updatedBookData.isbn,
        });

        handleUpdateBook(updatedBookData);
    } else { // Add new book
      const newBook: Book = {
        id: crypto.randomUUID(),
        title: data.title,
        author: data.author,
        isbn: data.isbn || '',
        summary: data.summary || '',
        completionDate: data.completionDate || '',
        genre: data.genre || '',
        coverImage: data.coverImage || `https://picsum.photos/seed/${encodeURIComponent(data.title)}/300/450`,
        rating: data.rating || 0,
        quotes: [],
        pageCount: data.pageCount || 0,
      };

      await syncBookToSheet({
        action: 'add',
        bookData: {
          title: newBook.title,
          author: newBook.author,
          isbn: newBook.isbn,
          summary: newBook.summary,
          completionDate: newBook.completionDate,
          quotes: newBook.quotes,
        }
      });
      setBooks([...books, newBook]);
    }
  };
  
  const handleUpdateBook = (bookData: Book) => {
    setBooks(books.map(b => b.id === bookData.id ? bookData : b));
    if(selectedBook && selectedBook.id === bookData.id) {
        setSelectedBook(bookData);
    }
  };

  const handleDeleteBook = (bookId: string) => {
    // TODO: Add Google Sheet deletion logic if needed
    setBooks(books.filter(b => b.id !== bookId));
    setSelectedBook(null);
    setModal(null);
  };

  // Quote CRUD
  const handleAddQuote = (bookId: string, quoteData: Omit<Quote, 'id'>) => {
    const newQuote: Quote = { ...quoteData, id: crypto.randomUUID() };
    let updatedBook: Book | null = null;
    const updatedBooks = books.map(book => {
        if(book.id === bookId) {
            const newQuotes = [...book.quotes, newQuote];
            updatedBook = { ...book, quotes: newQuotes };
            if(selectedBook?.id === bookId) setSelectedBook(updatedBook);
            return updatedBook;
        }
        return book;
    });
    setBooks(updatedBooks);

    if (updatedBook) {
      syncBookToSheet({
        action: 'update',
        bookData: {
          title: updatedBook.title,
          author: updatedBook.author,
          isbn: updatedBook.isbn || '',
          summary: updatedBook.summary,
          completionDate: updatedBook.completionDate || '',
          quotes: updatedBook.quotes,
        },
        lookupIsbn: updatedBook.isbn || '',
      });
    }
  }

  const handleUpdateQuote = (bookId: string, quoteData: Quote) => {
    let updatedBook: Book | null = null;
    const updatedBooks = books.map(book => {
        if(book.id === bookId) {
            const updatedQuotes = book.quotes.map(q => q.id === quoteData.id ? quoteData : q);
            updatedBook = { ...book, quotes: updatedQuotes };
            if(selectedBook?.id === bookId) setSelectedBook(updatedBook);
            return updatedBook;
        }
        return book;
    });
    setBooks(updatedBooks);

    if (updatedBook) {
      syncBookToSheet({
        action: 'update',
        bookData: {
          title: updatedBook.title,
          author: updatedBook.author,
          isbn: updatedBook.isbn || '',
          summary: updatedBook.summary,
          completionDate: updatedBook.completionDate || '',
          quotes: updatedBook.quotes,
        },
        lookupIsbn: updatedBook.isbn || '',
      });
    }
  }

  const handleDeleteQuote = (bookId: string, quoteId: string) => {
    let updatedBook: Book | null = null;
    const updatedBooks = books.map(book => {
        if(book.id === bookId) {
            const updatedQuotes = book.quotes.filter(q => q.id !== quoteId);
            updatedBook = { ...book, quotes: updatedQuotes };
            if(selectedBook?.id === bookId) setSelectedBook(updatedBook);
            return updatedBook;
        }
        return book;
    });
    setBooks(updatedBooks);

    if (updatedBook) {
      syncBookToSheet({
        action: 'update',
        bookData: {
          title: updatedBook.title,
          author: updatedBook.author,
          isbn: updatedBook.isbn || '',
          summary: updatedBook.summary,
          completionDate: updatedBook.completionDate || '',
          quotes: updatedBook.quotes,
        },
        lookupIsbn: updatedBook.isbn || '',
      });
    }
  }


  // View Control
  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };
  
  const handleDeselectBook = () => {
    setSelectedBook(null);
    setSearchQuery('');
    setSearchType('title');
  };

  const getModalTitle = () => {
    if (!modal) return '';
    switch (modal.type) {
        case 'add-book': return '새 책 추가하기';
        case 'edit-book': return '책 정보 수정하기';
        case 'add-quote': return '새 글귀 추가하기';
        case 'edit-quote': return '글귀 수정하기';
        case 'delete-book-confirm': return '책 삭제';
        default: return '';
    }
  }
  
  let modalContent: React.ReactNode = null;
  let modalFooter: React.ReactNode = null;
  
  if (modal) {
    if (modal.type === 'delete-book-confirm') {
      modalContent = <p className="text-slate-700 dark:text-slate-300">'{modal.book.title}' 책을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>;
      modalFooter = (
        <>
          <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600">취소</button>
          <button 
            type="button" 
            onClick={() => handleDeleteBook(modal.book.id)} 
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            삭제
          </button>
        </>
      );
    } else {
      let formId = '';
      switch (modal.type) {
        case 'add-book':
        case 'edit-book':
          formId = 'book-form';
          break;
        case 'add-quote':
        case 'edit-quote':
          formId = 'quote-form';
          break;
      }

      modalFooter = (
        <>
          <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600">취소</button>
          <button type="submit" form={formId} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700">저장</button>
        </>
      );

      switch (modal.type) {
        case 'add-book':
          modalContent = <BookForm id={formId} onSave={handleSaveBookForm} onClose={() => setModal(null)} />;
          break;
        case 'edit-book':
          modalContent = <BookForm id={formId} bookToEdit={modal.book} onSave={(data) => handleSaveBookForm({...data, id: modal.book.id})} onClose={() => setModal(null)} />;
          break;
        case 'add-quote':
          modalContent = <QuoteForm id={formId} onSave={(data) => handleAddQuote(modal.bookId, data)} onClose={() => setModal(null)} />;
          break;
        case 'edit-quote':
          modalContent = <QuoteForm id={formId} quoteToEdit={modal.quote} onSave={(data) => handleUpdateQuote(modal.bookId, {...data, id: modal.quote.id})} onClose={() => setModal(null)} />;
          break;
      }
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header onLogoClick={handleDeselectBook} theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto">
        {selectedBook ? (
          <BookDetail 
            book={selectedBook} 
            onBack={handleDeselectBook} 
            onEditBook={(book) => setModal({type: 'edit-book', book})}
            onDeleteBook={(book) => setModal({type: 'delete-book-confirm', book})}
            onAddQuote={(bookId) => setModal({type: 'add-quote', bookId})}
            onEditQuote={(bookId, quote) => setModal({type: 'edit-quote', bookId, quote})}
            onDeleteQuote={handleDeleteQuote}
            />
        ) : (
          <BookList 
            books={books} 
            onSelectBook={handleSelectBook} 
            onAddBook={() => setModal({type: 'add-book'})}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchType={searchType}
            setSearchType={setSearchType}
            />
        )}
      </main>
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={getModalTitle()} footer={modalFooter}>
        {modalContent}
      </Modal>
    </div>
  );
}

export default App;