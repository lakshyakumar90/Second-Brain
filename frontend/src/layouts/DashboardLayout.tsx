import React, { useState, useEffect } from 'react';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/sidebar/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [sidebarState, setSidebarState] = useState<'collapsed' | 'shrunk' | 'expanded'>('collapsed');

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarState') as 'collapsed' | 'shrunk' | 'expanded' | null;
    if (savedSidebarState && ['collapsed', 'shrunk', 'expanded'].includes(savedSidebarState)) {
      setSidebarState(savedSidebarState);
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarState', sidebarState);
  }, [sidebarState]);

  const toggleSidebar = (event: React.MouseEvent) => { 
    if (sidebarState === 'expanded') {
      const isInHoverSpace = event.clientX <= (20 + 256);
      if (isInHoverSpace) {
        setSidebarState('shrunk');
      } else {
        setSidebarState('collapsed');
      }
    } else {
      setSidebarState('expanded');
    }
  };

  useEffect(()=>{
    const handleMouseMove = (e: MouseEvent) => {
      const triggerWidth = 20;
      const sidebarWidth = 256;

      if(e.clientX <= triggerWidth && !isHovering && sidebarState !== 'expanded'){
        setSidebarState('shrunk');
        setIsHovering(true);
      }

      const isOverSidebar = e.clientX >= 0 && e.clientX <= sidebarWidth;
      if(!isOverSidebar && sidebarState !== 'expanded'){
        setSidebarState('collapsed');
        setIsHovering(false);
      }
    };

    document.body.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.body.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isHovering, sidebarState]);

  // Determine if sidebar is visible (for mobile overlay and content shift)
  const isVisible = sidebarState !== 'collapsed';

  return (
    <div className="min-h-screen">
      <Navbar onToggleSidebar={toggleSidebar} sidebarState={sidebarState} />

      <div className="flex">
        {/* Sidebar Wrapper */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-all duration-300 ease-in-out overflow-hidden
            ${sidebarState === 'collapsed' ? '-translate-x-full' : 'translate-x-0'}
            ${sidebarState === 'shrunk' ? 'h-[70vh] top-[15vh]' : 'h-full top-0'} // Shrunk: 70vh, centered
            ${sidebarState === 'expanded' ? 'h-full top-0' : ''}
          `}
        >
          <Sidebar onToggleSidebar={toggleSidebar} sidebarState={sidebarState} />
        </div>

        {/* Overlay for mobile */}
        {isVisible && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarState('collapsed')} // Close on overlay click
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${
          isVisible ? 'lg:ml-64' : 'ml-0'
        }`}>
          <div className="mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
