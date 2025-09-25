import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { XIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  footer?: React.ReactNode;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ isOpen, onClose, title, children, footer }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 z-50 flex justify-center items-center"
    >
      <div 
        ref={modalContentRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {footer && (
            <div className="flex justify-end space-x-2 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                {footer}
            </div>
        )}
      </div>
    </div>
  );
};

export default Modal;