import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import RecentlyVisited from "@/components/dashboard/dashboard-home/RecentlyVisited";
import HeroHeader from "@/components/dashboard/dashboard-home/HeroHeader";
import WorkspaceOverview from "@/components/dashboard/dashboard-home/WorkspaceOverview";
import AiInput from "@/components/ui/ai-input";
import PinnedItems from "@/components/dashboard/dashboard-home/PinnedItems";
import Collaborations from "@/components/dashboard/dashboard-home/Collaborations";
import { Button } from "@/components/ui/button";
import { pageApi } from "@/services/pageApi";
import { Plus, Loader2 } from "lucide-react";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Debug authentication state
  console.log('DashboardHome - Auth state:', { isAuthenticated, user: user ? { id: user._id, email: user.email } : null });

  const handleCreatePage = async () => {
    try {
      console.log('Creating page - Auth state:', { isAuthenticated, user: user ? { id: user._id, email: user.email } : null });
      setIsCreating(true);
      // Create a new empty page with proper initial editor state
      const response = await pageApi.createPage({
        title: 'Untitled',
        content: '',
        editorState: {
          root: {
            children: [
              {
                children: [],
                direction: null,
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1
              }
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "root",
            version: 1
          }
        }
      });
      
      console.log('Page creation response:', response);
      const pageId = response?.page?._id || response?.page?.id;
      if (pageId) {
        // Navigate to the new page
        navigate(`/pages/${pageId}`);
      } else {
        console.error('No page ID returned from server');
      }
    } catch (error) {
      console.error('Failed to create page:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-7">
      <HeroHeader />

      <div className="w-full">
        <AiInput />
      </div>

      {/* Create Page Button */}
      <div className="w-full flex justify-center">
        <Button 
          onClick={handleCreatePage} 
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isCreating ? 'Creating...' : 'Create New Page'}
        </Button>
      </div>

      <div className="w-full py-5">
        <WorkspaceOverview />
      </div>

      <div className="w-full py-5">
        <RecentlyVisited />
      </div>

      <div className="w-full py-5">
        <PinnedItems />
      </div>

      <div className="w-full py-5">
        <Collaborations />
      </div>
    </div>
  );
};

export default DashboardHome;
