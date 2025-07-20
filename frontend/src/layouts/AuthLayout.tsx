import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col">
      <header className="absolute top-0 left-0 right-0 border-b shadow-sm">
        <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex h-8 items-center">
          <img src="/mneumonicore.svg" alt="Nuemonicore" className="size-40" />
          </Link>
        </div>
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