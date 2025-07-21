import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ChevronsLeft, SquarePen, Edit3 } from "lucide-react";
import { useState } from "react";

interface SidebarHeaderProps {
  onToggleSidebar?: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onToggleSidebar }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex items-center justify-between hover:bg-sidebar-primary-foreground rounded-md "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer p-1 pl-2">
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarImage
            src="https://github.com/shadcn.png"
            className="rounded-sm"
          />
          <AvatarFallback className="rounded-sm">CN</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 pr-2">
            <h2 className="font-semibold text-sm text-foreground truncate">
              Lakshya Kumar's Notion
            </h2>
            {isHovered && (
              <Edit3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 p-1">
        <div className="p-1 hover:bg-sidebar-accent rounded-sm">
          <ChevronsLeft
            onClick={onToggleSidebar}
            className="h-5 text-[#AAAAAA] hover:bg-sidebar-accent rounded-sm transition-colors cursor-pointer"
          />
        </div>
        <div className="p-1 hover:bg-sidebar-accent rounded-sm">
          <SquarePen className="h-5 text-[#AAAAAA] hover:bg-sidebar-accent rounded-sm transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
