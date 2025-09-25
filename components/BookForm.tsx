import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import StarRating from './StarRating';
import { SparklesIcon, CalendarIcon, SearchIcon } from './icons';
import { generateReview } from '../services/geminiService';
import { fetchBookByISBN } from '../services/openLibraryService';
import Calendar from './Calendar';

interface BookFormProps {
  id: string;
  bookToEdit?: Book;
  onSave: (bookData: Partial<Book> & { id?: string; title: string; author: string; }) => void;
  onClose: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ id, bookToEdit, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [rating, setRating] = useState(0);
  const [summary, setSummary] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [completionDate, setCompletionDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingByIsbn, setIsFetchingByIsbn] = useState(false);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const isEditMode = !!bookToEdit;

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setIsbn(bookToEdit.isbn || '');
      setGenre(bookToEdit.genre);
      setCoverImage(bookToEdit.coverImage);
      setRating(bookToEdit.rating);
      setSummary(bookToEdit.summary);
      setPageCount(bookToEdit.pageCount);
      setCompletionDate(bookToEdit.completionDate || '');
    }
  }, [bookToEdit]);

  useEffect(() => {
    if (!isCalendarOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handleIsbnSearch = async () => {
    if (!isbn) {
        alert("ISBN을 입력해주세요.");
        return;
    }
    setIsFetchingByIsbn(true);
    const bookData = await fetchBookByISBN(isbn);
    setIsFetchingByIsbn(false);

    if (bookData) {
        setTitle(bookData.title);
        setAuthor(bookData.author);
        if (bookData.pageCount) {
          setPageCount(bookData.pageCount);
        }
        if (bookData.coverImage) {
          setCoverImage(bookData.coverImage);
        }
        alert("책 정보를 성공적으로 가져왔습니다.");
    } else {
        alert("해당 ISBN으로 책 정보를 찾을 수 없습니다. 직접 입력해주세요.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
        alert("서명과 저자는 필수 항목입니다.");
        return;
    }

    if (isEditMode) {
      onSave({
        id: bookToEdit?.id,
        title,
        author,
        isbn,
        genre,
        coverImage,
        rating,
        summary,
        pageCount: Number(pageCount),
        completionDate,
      });
    } else {
      onSave({
        title,
        author,
        isbn,
        summary,
        completionDate,
        coverImage,
        pageCount: Number(pageCount),
      });
    }
    onClose();
  };
  
  const handleGenerateReview = async () => {
    if (!title || !author) {
        alert("AI 서평을 생성하려면 먼저 책 서명과 저자를 입력해야 합니다.");
        return;
    }
    setIsGenerating(true);
    const generatedSummary = await generateReview(title, author);
    setSummary(generatedSummary);
    setIsGenerating(false);
  };
  
  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500";
  const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <form id={id} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className={labelStyle}>서명 *</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputStyle} />
      </div>
      <div>
        <label htmlFor="author" className={labelStyle}>저자 *</label>
        <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required className={inputStyle} />
      </div>
      <div>
        <label htmlFor="isbn" className={labelStyle}>ISBN</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input 
            type="text" 
            id="isbn" 
            value={isbn} 
            onChange={(e) => setIsbn(e.target.value)} 
            className="relative block w-full rounded-none rounded-l-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:z-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm" 
            placeholder="'-' 없이 숫자만 입력"
          />
          <button 
            type="button" 
            onClick={handleIsbnSearch}
            disabled={isFetchingByIsbn || !isbn}
            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SearchIcon className="h-5 w-5 text-gray-400"/>
            <span className="hidden sm:inline">{isFetchingByIsbn ? '검색 중...' : '정보 가져오기'}</span>
          </button>
        </div>
      </div>

      <div className="relative" ref={datePickerRef}>
        <label htmlFor="completionDate" className={labelStyle}>독서 완료일</label>
        <div className="relative">
          <input
            type="text"
            id="completionDate"
            value={completionDate}
            readOnly
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            placeholder="날짜를 선택하세요"
            className={`${inputStyle} cursor-pointer`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        {isCalendarOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-600 ring-opacity-5">
            <Calendar
              selectedDate={completionDate}
              onSelect={(date) => {
                setCompletionDate(date);
                setIsCalendarOpen(false);
              }}
            />
          </div>
        )}
      </div>
      
      <div>
          <label htmlFor="pageCount" className={labelStyle}>총 페이지 수</label>
          <input type="number" id="pageCount" value={pageCount} onChange={(e) => setPageCount(Number(e.target.value))} className={inputStyle} />
      </div>

      {isEditMode && (
        <>
            <div>
                <label htmlFor="genre" className={labelStyle}>장르</label>
                <input type="text" id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className={inputStyle} />
            </div>
            <div>
                <label htmlFor="coverImage" className={labelStyle}>표지 이미지 URL</label>
                <input type="text" id="coverImage" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="비워두면 자동 생성됩니다" className={inputStyle} />
            </div>
            <div>
                <label className={labelStyle}>평점</label>
                <StarRating rating={rating} setRating={setRating} />
            </div>
        </>
      )}

      <div>
        <div className="flex justify-between items-center mb-1">
            <label htmlFor="summary" className={labelStyle}>요약 및 감상</label>
            <button 
                type="button" 
                onClick={handleGenerateReview}
                disabled={isGenerating}
                className="flex items-center text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed">
                <SparklesIcon className="w-4 h-4 mr-1"/>
                {isGenerating ? "생성 중..." : "AI 서평 생성"}
            </button>
        </div>
        <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} className={inputStyle} />
      </div>
    </form>
  );
};

export default BookForm;