import { Button } from "@/components/ui/button";
import { Book, Plus } from "lucide-react";

const WorkspaceOverview = () => {
  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Book className="w-3 h-3" />
          <h1 className="">Workspace Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-muted-foreground text-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="min-h-60 w-full bg-secondary rounded-lg p-6 flex flex-col relative overflow-hidden">
        {/* Notion-like workspace items */}
        <div className="flex-1 space-y-3">
          {/* Sample workspace items */}
          <div className="flex items-center gap-3 p-3 hover:bg-background/50 rounded-md transition-colors cursor-pointer group">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm">
              📄
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">Untitled Workspace</h3>
              <p className="text-xs text-muted-foreground">
                Created 2 hours ago
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 hover:bg-background/50 rounded-md transition-colors cursor-pointer group">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm">
              🎨
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">Design Concepts</h3>
              <p className="text-xs text-muted-foreground">Created yesterday</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 hover:bg-background/50 rounded-md transition-colors cursor-pointer group">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm">
              📊
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">Project Dashboard</h3>
              <p className="text-xs text-muted-foreground">
                Created 3 days ago
              </p>
            </div>
          </div>
        </div>

        {/* Gradient overlay for blur effect */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-secondary via-secondary/80 to-transparent pointer-events-none"></div>

        {/* Expand button at bottom with blur backdrop */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pt-4">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground text-sm h-8 backdrop-blur-sm bg-background/20 border border-border/30 hover:bg-background/30 transition-all duration-200"
          >
            Expand
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceOverview;
