import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsLeft, SquarePen, Edit3 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  onToggleSidebar?: (event: React.MouseEvent) => void;
  sidebarState?: 'collapsed' | 'shrunk' | 'expanded';
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onToggleSidebar, sidebarState }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isCollapsed = sidebarState === 'collapsed';
  const isShrunk = sidebarState === 'shrunk';
  const showLabels = !isCollapsed && !isShrunk;

  return (
    <div
      className={cn(
        "flex items-center justify-between hover:bg-secondary/50 rounded-md transition-colors p-1",
        !showLabels && "justify-center"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarImage
            src="https://github.com/shadcn.png"
            className="rounded-sm"
          />
          <AvatarFallback className="rounded-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
            LK
          </AvatarFallback>
        </Avatar>
        
        { (
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-sm text-foreground truncate">
                Lakshya Kumar's Second Brain
              </h2>
              {isHovered && (
                <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground flex-shrink-0 cursor-pointer" />
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Hide chevron left icon when sidebar is in shrunk state */}
        {sidebarState !== 'shrunk' && (
          <div 
            className="p-1 hover:bg-secondary rounded-sm cursor-pointer transition-colors"
            onClick={onToggleSidebar}
          >
            <ChevronsLeft className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </div>
        )}
        <div className="p-1 hover:bg-secondary rounded-sm cursor-pointer transition-colors">
          <SquarePen className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
