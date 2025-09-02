import React, { useState } from "react";
import { X, Search, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface PagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pages: any[];
  isLoading: boolean;
}

const PagesPanel: React.FC<PagesPanelProps> = ({
  isOpen,
  onClose,
  pages,
  isLoading,
}) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredPages = pages.filter((page) =>
    page.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
      <div className="w-96 h-full bg-background border-l flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Pages</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/home')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No pages found matching your search." : "No pages yet."}
              </p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/home')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first page
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredPages.map((page) => (
                <div
                  key={page._id}
                  className="flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => {
                    navigate(`/pages/${page._id}`);
                    onClose();
                  }}
                >
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">
                      {page.title || 'Untitled'}
                    </h3>
                    {page.summary && (
                      <p className="text-xs text-muted-foreground truncate">
                        {page.summary}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            {filteredPages.length} of {pages.length} pages
          </p>
        </div>
      </div>
    </div>
  );
};

export default PagesPanel;
