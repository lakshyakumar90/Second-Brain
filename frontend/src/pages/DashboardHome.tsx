import HeroHeader from "@/components/dashboard/dashboard-home/HeroHeader";
import AiInput from "@/components/ui/ai-input";

const DashboardHome = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-7">
      <HeroHeader />

      <div className="w-full">
        <AiInput />
      </div>

      <div className="w-full py-5">
      
      </div>
    </div>
  );
};

export default DashboardHome;
