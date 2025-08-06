import React, { useEffect } from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {

  useEffect(() => {
    document.body.classList.remove('dark');
  }, []);

  return <div className="overflow-x-hidden font-[neue-regular]">{children}</div>;
};

export default PublicLayout;
