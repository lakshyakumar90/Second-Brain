import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from '@/hooks/useLenis';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  // Initialize Lenis smooth scrolling for all public pages
  const lenis = useLenis();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.remove('dark');
    // Keep body scroll enabled; Lenis will handle smoothing.
    document.body.style.overflow = 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      // Fallback if Lenis isn't ready yet
      window.scrollTo(0, 0);
    }
  }, [location.pathname, lenis]);

  return <div className="overflow-x-hidden font-[neue-regular]">{children}</div>;
};

export default PublicLayout;
