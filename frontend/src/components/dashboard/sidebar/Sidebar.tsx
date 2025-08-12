import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Home,
  Inbox,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  FileStack,
  Trash2,
  UserPlus,
  FileText,
  Image,
  Video,
  Link,
  Star,
  Clock,
  Hash,
  FolderPlus,
  CircleQuestionMark
} from "lucide-react";
import SidebarHeader from "./SidebarHeader";
import { cn } from "@/lib/utils";
import SearchModal from "@/components/search/SearchModal";
import { type UIItem } from "@/types/items";

interface SidebarProps {
  onToggleSidebar?: (event: React.MouseEvent) => void;
  sidebarState?: "collapsed" | "shrunk" | "expanded";
  onSearchOpen?: () => void;
  onCloseSidebar?: () => void;
}

// Sample data structure - replace with actual API calls
const sampleWorkspaces = [
  {
    id: 1,
    name: "Lakshya Kumar's Second Brain",
    emoji: "🧠",
    isOwner: true,
    memberCount: 3,
  },
  {
    id: 2,
    name: "Team Collaboration",
    emoji: "👥",
    isOwner: false,
    memberCount: 8,
  },
  { id: 3, name: "Project Alpha", emoji: "🚀", isOwner: false, memberCount: 5 },
];

const sampleCategories = [
  { id: 1, name: "Learning", icon: "📚", color: "#3B82F6", count: 12 },
  { id: 2, name: "Projects", icon: "🛠️", color: "#10B981", count: 8 },
  { id: 3, name: "Ideas", icon: "💡", color: "#F59E0B", count: 15 },
  { id: 4, name: "Resources", icon: "📂", color: "#8B5CF6", count: 6 },
];

const Sidebar: React.FC<SidebarProps> = ({ onToggleSidebar, sidebarState, onSearchOpen, onCloseSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWorkspacesExpanded, setIsWorkspacesExpanded] = useState(true);
  const [isPrivateExpanded, setIsPrivateExpanded] = useState(true);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const isCollapsed = sidebarState === "collapsed";
  const isShrunk = sidebarState === "shrunk";
  const showLabels = !isCollapsed;

  const MenuItem = ({
    icon: Icon,
    label,
    count,
    onClick,
    className = "",
    isActive = false,
  }: {
    icon: React.ElementType;
    label: string;
    count?: number;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm",
        "hover:bg-secondary/50 text-muted-foreground hover:text-foreground",
        isActive && "bg-secondary text-foreground",
        className
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {showLabels && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {count !== undefined && (
            <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
              {count}
            </span>
          )}
        </>
      )}
    </div>
  );

  const SectionHeader = ({
    label,
    isExpanded,
    onToggle,
    hasAddButton = false,
    onAdd,
  }: {
    label: string;
    isExpanded: boolean;
    onToggle: () => void;
    hasAddButton?: boolean;
    onAdd?: () => void;
  }) => (
    <div className="flex items-center justify-between group py-1">
      <div
        onClick={onToggle}
        className="flex items-center gap-1 cursor-pointer hover:text-foreground text-muted-foreground flex-1"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {showLabels && (
          <span className="text-xs font-medium uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
      {showLabels && hasAddButton && (
        <Plus
          onClick={onAdd}
          className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        />
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-background border-r transition-all duration-200",
        isCollapsed ? "w-0 overflow-hidden" : isShrunk ? "w-64" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-2 border-b">
        <SidebarHeader
          onToggleSidebar={onToggleSidebar}
          sidebarState={sidebarState}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto py-2">
        {/* Section 1: Search, Home, Inbox */}
        <div className="px-2 space-y-1 mb-4">
          <MenuItem 
            icon={Search} 
            label="Search" 
            onClick={() => {
              onSearchOpen?.();
              onCloseSidebar?.();
            }} 
          />
          <MenuItem 
            icon={Home} 
            label="Home" 
            isActive={location.pathname === '/home'}
            onClick={() => navigate('/home')}
          />
          <MenuItem icon={Inbox} label="Inbox" count={3} />
        </div>

        {/* Section 2: Workspaces/Teamspaces */}
        <div className="px-2 mb-4">
          <SectionHeader
            label="Teamspaces"
            isExpanded={isWorkspacesExpanded}
            onToggle={() => setIsWorkspacesExpanded(!isWorkspacesExpanded)}
            hasAddButton
            onAdd={() => console.log("Add workspace")}
          />
          {isWorkspacesExpanded && showLabels && (
            <div className="ml-2 space-y-1 mt-2">
              {sampleWorkspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-secondary/50 text-sm"
                >
                  <span className="text-sm">{workspace.emoji}</span>
                  <span className="flex-1 truncate">{workspace.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {workspace.memberCount}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-secondary/50 text-sm text-muted-foreground">
                <FolderPlus className="h-4 w-4" />
                <span>Create workspace</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Private Collection */}
        <div className="px-2 mb-4">
          <SectionHeader
            label="Private"
            isExpanded={isPrivateExpanded}
            onToggle={() => setIsPrivateExpanded(!isPrivateExpanded)}
          />
          {isPrivateExpanded && showLabels && (
            <div className="ml-2 space-y-1 mt-2">
              <MenuItem 
                icon={FileText} 
                label="Items" 
                isActive={location.pathname === '/items'}
                onClick={() => navigate('/items')}
              />
              <MenuItem icon={Star} label="Favorites" count={7} />
              <MenuItem icon={Clock} label="Recent" />
              <MenuItem icon={FileText} label="Documents" count={23} />
              <MenuItem icon={Image} label="Images" count={45} />
              <MenuItem icon={Video} label="Videos" count={12} />
              <MenuItem icon={Link} label="Links" count={18} />

              {/* Categories Subsection */}
              <div className="mt-3">
                <div className="flex items-center justify-between group px-2 py-1">
                  <div
                    onClick={() =>
                      setIsCategoriesExpanded(!isCategoriesExpanded)
                    }
                    className="flex items-center gap-1 cursor-pointer hover:text-foreground text-muted-foreground flex-1"
                  >
                    {isCategoriesExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium">Categories</span>
                  </div>
                  <Plus className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {isCategoriesExpanded && (
                  <div className="ml-4 space-y-1 mt-1">
                    {sampleCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-secondary/50 text-sm"
                      >
                        <span className="text-sm">{category.icon}</span>
                        <span className="flex-1 truncate">{category.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {category.count}
                        </span>
                      </div>
                    ))}
                    <div 
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-secondary/50 text-sm text-muted-foreground"
                      onClick={() => navigate('/categories')}
                    >
                      <Hash className="h-4 w-4" />
                      <span>Manage Categories</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Settings, Templates, Trash */}
        <div className="px-2 mb-4">
          <MenuItem icon={Settings} label="Settings" />
          <MenuItem icon={FileStack} label="Templates" />
          <MenuItem icon={Trash2} label="Trash" />
        </div>
      </div>

      {/* Footer - User section when expanded */}
      {showLabels && (
        <div className="border-t pb-2">
          <div className="px-2 pt-4">
            <MenuItem icon={UserPlus} label="Invite members" />
          </div>
          <div className="px-2">
            <MenuItem icon={CircleQuestionMark} label="Help" />
          </div>
        </div>
      )}

    {/* Search Modal */}
    <SearchModal
      isOpen={isSearchModalOpen}
      onClose={() => setIsSearchModalOpen(false)}
      onItemClick={(item) => {
        console.log('Item clicked:', item);
        // TODO: Navigate to item or open in editor
        setIsSearchModalOpen(false);
      }}
    />
    </div>
  );
};

export default Sidebar;
