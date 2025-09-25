import React, { useState, useEffect } from 'react';
import { Quote } from '../types';

interface QuoteFormProps {
  id: string;
  quoteToEdit?: Quote;
  onSave: (quoteData: Omit<Quote, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ id, quoteToEdit, onSave, onClose }) => {
  const [text, setText] = useState('');
  const [page, setPage] = useState<string | number>('');

  useEffect(() => {
    if (quoteToEdit) {
      setText(quoteToEdit.text);
      setPage(quoteToEdit.page ? String(quoteToEdit.page) : '');
    } else {
      setText('');
      setPage('');
    }
  }, [quoteToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!text) {
        alert("글귀 내용을 입력해주세요.");
        return;
    }
    onSave({
      id: quoteToEdit?.id,
      text,
      page,
    });
    onClose();
  };

  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500";
  const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <form id={id} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="quoteText" className={labelStyle}>글귀 내용 *</label>
        <textarea
          id="quoteText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={5}
          className={inputStyle}
          placeholder="인상 깊은 글귀를 입력하세요..."
        />
      </div>
      <div>
        <label htmlFor="page" className={labelStyle}>페이지</label>
        <input
          type="text"
          id="page"
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className={inputStyle}
          placeholder="페이지 번호를 입력하세요"
        />
      </div>
    </form>
  );
};

export default QuoteForm;