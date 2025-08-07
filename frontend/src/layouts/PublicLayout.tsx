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
    // Disable default scroll behavior when Lenis is active
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore default scroll behavior when leaving public pages
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
