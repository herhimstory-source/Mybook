import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark';

// Helper function to get the system's preferred color scheme
const getSystemTheme = (): Theme => {
  // This check ensures the code doesn't break in environments without a `window` object (e.g., server-side rendering)
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

export function useDarkMode(): [Theme, () => void] {
  // `useLocalStorage` will check for a saved 'theme' first.
  // If nothing is saved, it will fall back to the system preference provided by `getSystemTheme()`.
  const [theme, setTheme] = useLocalStorage<Theme>('theme', getSystemTheme());

  // This effect applies the correct class to the <html> element whenever the theme changes.
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Function to toggle the theme
  const toggleTheme = () => {
    // A functional update is safer to prevent race conditions.
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return [theme, toggleTheme];
}
