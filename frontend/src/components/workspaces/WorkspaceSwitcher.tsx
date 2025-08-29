import React, { useState } from 'react';
import { ChevronDown, Plus, Settings, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { cn } from '@/lib/utils';

interface WorkspaceSwitcherProps {
  onOpenCreateModal?: () => void;
  onOpenSettings?: () => void;
  onOpenMembers?: () => void;
  className?: string;
}

const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ 
  onOpenCreateModal, 
  onOpenSettings,
  onOpenMembers,
  className 
}) => {
  const { workspaces, currentWorkspace, switchWorkspace, isLoading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 p-2 rounded-md bg-muted/50", className)}>
        <div className="w-6 h-6 bg-muted animate-pulse rounded" />
        <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className={cn("p-2", className)}>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={onOpenCreateModal}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("p-2", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between h-auto p-2"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                {currentWorkspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium text-sm truncate">
                  {currentWorkspace.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {currentWorkspace.totalMembers} member{currentWorkspace.totalMembers !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-64">
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Workspaces
          </div>
          
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace._id}
              onClick={() => {
                switchWorkspace(workspace._id);
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                workspace._id === currentWorkspace._id && "bg-accent"
              )}
            >
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {workspace.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {workspace.totalMembers} member{workspace.totalMembers !== 1 ? 's' : ''}
                </div>
              </div>
              {workspace.isOwner && (
                <div className="text-xs text-muted-foreground">Owner</div>
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onOpenCreateModal} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </DropdownMenuItem>
          
          {currentWorkspace && (
            <>
              <DropdownMenuItem onClick={onOpenSettings} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Workspace Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={onOpenMembers} className="cursor-pointer">
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WorkspaceSwitcher;
