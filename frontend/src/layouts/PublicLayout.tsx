import React, { useEffect } from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  useEffect(() => {
    document.body.classList.remove('dark');
  }, []);
  return <>{children}</>;
};

export default PublicLayout;
