import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleCreatePage = async () => {
    try {
      setIsCreating(true);
      // Create a new empty page
      const response = await pageApi.createPage({
        title: 'Untitled',
        content: '',
        editorState: null
      });
      
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
