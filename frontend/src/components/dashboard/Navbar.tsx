import React from 'react';
import { Clock8, Ellipsis, Menu, Sun, Moon, ChevronsRight } from "lucide-react";
import { useDarkMode } from '@/contexts/DarkModeContext';

interface NavbarProps {
  onToggleSidebar?: (event: React.MouseEvent) => void;
  sidebarState?: 'collapsed' | 'shrunk' | 'expanded';
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, sidebarState }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  // Show ChevronsRight when sidebar is in shrunk state, otherwise show Menu
  const MenuIcon = sidebarState === 'shrunk' ? ChevronsRight : Menu;
  
  return (
    <div className="px-2 py-2">
      <div className="flex items-center justify-between">
        <button 
          onClick={onToggleSidebar}
          className="p-1 hover:bg-secondary rounded-sm transition-colors"
        >
          <MenuIcon className="text-[#AAAAAA] h-5 cursor-pointer" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-1 hover:bg-secondary rounded-sm transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="text-yellow-400 h-5" /> : <Moon className="text-[#AAAAAA] h-5" />}
          </button>
          <div className="p-1 hover:bg-secondary rounded-sm">
            <Clock8 className="text-[#AAAAAA] h-5" />
          </div>
          <div className="p-1 hover:bg-secondary rounded-sm">
            <Ellipsis className="text-[#AAAAAA] h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
