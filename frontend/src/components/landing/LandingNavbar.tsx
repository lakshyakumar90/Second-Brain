import { motion } from "framer-motion";
import clsx from "clsx";
import { Link, useNavigate, useLocation } from "react-router-dom";

const tabs = [
    {
        name: "Home",
        path: "/",
    },
    {
        name: "AI",
        path: "/ai",
    },
    {
        name: "About",
        path: "/about",
    },
    {
        name: "Contact",
        path: "/contact",
    },
    {
        name: "Get Started",
        path: "/auth/register", 
    },
];

// Separate component for absolute navigation
export const AbsoluteNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Find active tab based on current location
  const activeTab = tabs.find(tab => tab.path === location.pathname) || tabs[0];

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <div className="h-14 px-2 bg-[#f5f5eb] rounded-full flex items-center shadow-md">
        <div className="relative flex items-center gap-2 px-2">
          {tabs.map((tab) => (
            <Link to={tab.path} key={tab.name}>
              <button
                onClick={() => navigate(tab.path)}
                className={clsx(
                  "relative z-10 px-3 py-2 rounded-full font-[neue-medium] font-semibold text-md transition-colors whitespace-nowrap cursor-pointer hover:bg-black/10",
                  activeTab.name === tab.name ? "text-green-400" : "text-black/80"
                )}
              >
                {activeTab.name === tab.name && (
                  <motion.div
                    layoutId="highlight"
                    className="absolute inset-0 bg-black rounded-full z-[-1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                {tab.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const LandingNavbar = () => {
  return (
    <>
      {/* Absolute navigation - always at top */}
      <AbsoluteNavigation />
      
      {/* Header with logos - scrolls with content */}
      <header className="bg-[#F3F3E9] flex items-center justify-between px-10 py-6">
        <div className="w-48">
          <motion.img
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            src="/black-logo.png"
            alt="Nuemonicore"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="h-10">
          <motion.img
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            src="/mneumonicorelogo.svg"
            alt="Nuemonicore"
            className="h-full w-full object-contain"
          />
        </div>
      </header>
    </>
  );
};

export default LandingNavbar;
