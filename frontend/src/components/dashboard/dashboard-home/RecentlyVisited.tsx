import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  DashboardCarousel as DashboardCarouselBase, 
  DashboardCarouselContent, 
  DashboardCarouselItem, 
  DashboardCarouselPrevious, 
  DashboardCarouselNext 
} from "@/components/ui/dashboard-carousel";
import { Card } from "@/components/ui/card";

// Example data (more items added)
const recentItems = [
  { title: "C++ Basics and STL" },
  { title: "DSA" },
  { title: "Basic Hashing" },
  { title: "Sorting" },
  { title: "Basic Recursion" },
  { title: "Arrays and Strings" },
  { title: "Linked Lists" },
  { title: "Trees and Graphs" },
];

const RecentlyVisited = () => {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="w-3 h-3" />
          <h1>Recently Visited</h1>
        </div>

        <div className="relative">
          <DashboardCarouselBase
            className="w-full"
            opts={{
              align: "start",
              loop: false,  // Set to true if you want infinite looping
            }}
          >
            <DashboardCarouselContent className="-ml-4">
              {recentItems.map((item, i) => (
                <DashboardCarouselItem key={i} className="pl-4 basis-[140px]">
                  <Card className="h-24 bg-secondary flex items-end p-4 shadow-none">
                    <span className="font-medium text-sm">{item.title}</span>
                  </Card>
                </DashboardCarouselItem>
              ))}
            </DashboardCarouselContent>
            <DashboardCarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background">
              <ChevronLeft className="h-4 w-4" />
            </DashboardCarouselPrevious>
            <DashboardCarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background">
              <ChevronRight className="h-4 w-4" />
            </DashboardCarouselNext>
          </DashboardCarouselBase>
        </div>
      </div>
    </div>
  );
};

export default RecentlyVisited;