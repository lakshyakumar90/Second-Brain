import { Home, FileText, Settings, User, LogOut } from "lucide-react";
import SidebarHeader from "./SidebarHeader";

interface SidebarProps {
  onToggleSidebar?: (event: React.MouseEvent) => void;
  sidebarState?: 'collapsed' | 'shrunk' | 'expanded';
}

const Sidebar: React.FC<SidebarProps> = ({ onToggleSidebar, sidebarState }) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Notes", href: "/notes" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="h-full flex flex-col bg-sidebar-primary p-2">
      {/* Header */}
      <SidebarHeader onToggleSidebar={onToggleSidebar} sidebarState={sidebarState} />

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-primary-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-primary-foreground transition-colors w-full">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
