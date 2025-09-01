import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  DashboardCarousel as DashboardCarouselBase, 
  DashboardCarouselContent, 
  DashboardCarouselItem, 
  DashboardCarouselPrevious, 
  DashboardCarouselNext 
} from "@/components/ui/dashboard-carousel";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { itemApi } from "@/services/itemApi";
import { useWorkspace } from "@/contexts/WorkspaceContext";

type SimpleItem = { id: string; title: string };

const RecentlyVisited = () => {
  const [items, setItems] = useState<SimpleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Sort by lastViewedAt desc to simulate recent visits
        const params: any = { limit: 20, sortBy: 'lastViewedAt', sortOrder: 'desc' };
        if (currentWorkspace) {
          params.workspace = currentWorkspace._id;
        }
        const res = await itemApi.getItems(params);
        const list = (res?.data?.items || res?.items || []).map((it: any) => ({ id: it._id || it.id, title: it.title || 'Untitled' }));
        if (mounted) setItems(list);
      } catch (e) {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentWorkspace]);

  // Hide the section if there are no items and not loading
  if (!loading && items.length === 0) {
    return null;
  }

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
              {(loading ? Array.from({ length: 6 }).map((_, i) => ({ id: `skeleton-${i}`, title: '' })) : items).map((item, i) => (
                <DashboardCarouselItem key={i} className="pl-4 basis-[140px]">
                  <Card 
                    className="h-24 bg-secondary flex items-end p-4 shadow-none cursor-pointer hover:bg-secondary/70"
                    onClick={() => { if (!loading) navigate(`/items/${item.id}`); }}
                    role="button"
                  >
                    <span className="font-medium text-sm">{loading ? ' ' : item.title}</span>
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