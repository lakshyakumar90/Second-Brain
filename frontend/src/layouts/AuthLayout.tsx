import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col">
      <header className="absolute top-0 left-0 right-0 border-b shadow-sm">
        <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex h-8 items-center">
            <h1 className="text-xl font-bold">Second Brain</h1>
          </div>
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