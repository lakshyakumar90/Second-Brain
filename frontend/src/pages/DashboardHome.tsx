import RecentlyVisited from "@/components/dashboard/dashboard-home/RecentlyVisited";
import HeroHeader from "@/components/dashboard/dashboard-home/HeroHeader";
import WorkspaceOverview from "@/components/dashboard/dashboard-home/WorkspaceOverview";
import AiInput from "@/components/ui/ai-input";
import PinnedItems from "@/components/dashboard/dashboard-home/PinnedItems";
import Collaborations from "@/components/dashboard/dashboard-home/Collaborations";

const DashboardHome = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-7">
      <HeroHeader />

      <div className="w-full">
        <AiInput />
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
