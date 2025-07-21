import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { Sun, Moon } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  return (
    <div className="flex flex-col">
      <header className="absolute top-0 left-0 right-0 border-b shadow-sm flex items-center justify-between">
        <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex h-8 items-center">
            <img src="/mneumonicore.svg" alt="Nuemonicore" className="size-40" />
          </Link>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 mr-4 hover:bg-secondary rounded-full transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="text-yellow-400 h-5 w-5" /> : <Moon className="text-[#AAAAAA] h-5 w-5" />}
        </button>
      </header>
      <main className="">
        <div className="h-screen mx-auto w-full flex items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;