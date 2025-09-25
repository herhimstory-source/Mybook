import React from 'react';
import { BookOpenIcon, SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  onLogoClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, theme, toggleTheme }) => {
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={onLogoClick} className="flex items-center focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg p-2 -ml-2">
            <BookOpenIcon className="h-8 w-8 text-sky-600" />
            <h1 className="ml-3 text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              내 서재
            </h1>
          </button>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;