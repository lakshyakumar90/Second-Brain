import React, { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/sidebar/Sidebar";
import { motion } from "motion/react"; // Corrected import (assuming Framer Motion)
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import SearchModal from "@/components/search/SearchModal";
import type { UIItem } from "@/types/items";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [sidebarState, setSidebarState] = useState<
    "collapsed" | "shrunk" | "expanded"
  >("collapsed");
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024); // lg breakpoint (1024px)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const savedSidebarState = localStorage.getItem("sidebarState") as
      | "collapsed"
      | "shrunk"
      | "expanded"
      | null;
    if (
      savedSidebarState &&
      ["collapsed", "shrunk", "expanded"].includes(savedSidebarState)
    ) {
      setSidebarState(savedSidebarState);
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebarState", sidebarState);
  }, [sidebarState]);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = (event: React.MouseEvent) => {
    if (sidebarState === "expanded") {
      const isInHoverSpace = event.clientX <= 20 + 256;
      if (isInHoverSpace) {
        setSidebarState("shrunk");
      } else {
        setSidebarState("collapsed");
      }
    } else {
      setSidebarState("expanded");
    }
  };

  const closeSidebar = () => {
    setSidebarState("collapsed");
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const triggerWidth = 20;
      const sidebarWidth = 248;

      if (
        e.clientX <= triggerWidth &&
        !isHovering &&
        sidebarState !== "expanded"
      ) {
        setSidebarState("shrunk");
        setIsHovering(true);
      }

      const isOverSidebar = e.clientX >= 0 && e.clientX <= sidebarWidth;
      if (!isOverSidebar && sidebarState !== "expanded") {
        setSidebarState("collapsed");
        setIsHovering(false);
      }
    };

    document.body.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.body.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHovering, sidebarState]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => {
      setIsSearchModalOpen(true);
      closeSidebar();
    },
  });

  // Framer Motion variants for main content (dynamic based on state and screen size)
  const mainVariants = {
    collapsed: { paddingLeft: 0 },
    shrunk: { paddingLeft: 0 }, // No shift on hover (overlays)
    expanded: { paddingLeft: isLargeScreen ? 256 : 0 }, // Shift only on large screens; overlays on small
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar onToggleSidebar={toggleSidebar} sidebarState={sidebarState} />

      <div className="flex flex-1 relative min-h-0">
        {/* Fixed Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-[9999] w-64 bg-background border-r transform transition-all duration-300 ease-in-out shadow-lg
            ${
              sidebarState === "collapsed"
                ? "-translate-x-full"
                : "translate-x-0"
            }
            ${
              sidebarState === "shrunk"
                ? "rounded-r-lg border-2"
                : "h-full top-0"
            }
            ${sidebarState === "expanded" ? "h-full top-0" : ""}
          `}
          style={{
            top: sidebarState === "shrunk" ? "10vh" : "",
            height:
              sidebarState === "shrunk" ? "calc(80vh)" : "100vh",
          }}
        >
                                <Sidebar
                        onToggleSidebar={toggleSidebar}
                        sidebarState={sidebarState}
                        onSearchOpen={() => setIsSearchModalOpen(true)}
                        onCloseSidebar={closeSidebar}
                      />
        </div>

        {/* Main Content - Scrollable */}
        <motion.main
          variants={mainVariants}
          initial="collapsed"
          animate={sidebarState}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          layout
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
        >
          <div className="mx-auto w-[90%] sm:w-[80%] md:w-[70%] lg:w-[60vw] py-3 px-4 sm:py-6 sm:px-6 lg:px-8">
            {children}
          </div>  
        </motion.main>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onItemClick={(item: UIItem) => {
          console.log('Item clicked:', item);
          // TODO: Navigate to item or open in editor
          setIsSearchModalOpen(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;
