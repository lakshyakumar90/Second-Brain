import { Clock, ChevronLeft, ChevronRight, FileText, File } from "lucide-react";
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
import { pageApi } from "@/services/pageApi";
import { useWorkspace } from "@/contexts/WorkspaceContext";

type SimpleItem = { 
  id: string; 
  title: string; 
  type: 'item' | 'page';
  lastViewedAt?: string | Date;
};

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
        const allItems: SimpleItem[] = [];
        
        if (currentWorkspace) {
          // Fetch recent items
          try {
            const itemParams: any = { 
              limit: 15, 
              sortBy: 'lastViewedAt', 
              sortOrder: 'desc', 
              workspace: currentWorkspace._id 
            };
            const itemRes = await itemApi.getItems(itemParams);
            
            const itemList = (itemRes?.data?.items || itemRes?.items || [])
              .map((it: any) => ({ 
                id: it._id || it.id, 
                title: it.title || 'Untitled',
                type: 'item' as const,
                lastViewedAt: it.lastViewedAt || it.updatedAt || it.createdAt // Fallback to updatedAt or createdAt
              }));
            allItems.push(...itemList);
          } catch (e) {
            console.error('Failed to fetch recent items:', e);
          }

          // Fetch recent pages
          try {
            const pageParams: any = { 
              limit: 15, 
              sortBy: 'lastViewedAt', 
              sortOrder: 'desc', 
              workspace: currentWorkspace._id 
            };
            const pageRes = await pageApi.getRecentPages(pageParams);
            
            const pageList = (pageRes?.data?.pages || pageRes?.pages || [])
              .map((page: any) => ({ 
                id: page._id || page.id, 
                title: page.title || 'Untitled Page',
                type: 'page' as const,
                lastViewedAt: page.lastViewedAt || page.updatedAt || page.createdAt // Fallback to updatedAt or createdAt
              }));
            allItems.push(...pageList);
          } catch (e) {
            console.error('Failed to fetch recent pages:', e);
          }

          // Sort combined list by lastViewedAt timestamp
          const sortedItems = allItems.sort((a, b) => {
            if (!a.lastViewedAt && !b.lastViewedAt) return 0;
            if (!a.lastViewedAt) return 1;
            if (!b.lastViewedAt) return -1;
            
            const dateA = new Date(a.lastViewedAt);
            const dateB = new Date(b.lastViewedAt);
            return dateB.getTime() - dateA.getTime(); // Most recent first
          });

          // If we have no items with lastViewedAt, try to get some recent items by updatedAt as fallback
          if (sortedItems.length === 0) {
            try {
              // Fetch recent items by updatedAt
              const fallbackItemParams: any = { 
                limit: 10, 
                sortBy: 'updatedAt', 
                sortOrder: 'desc', 
                workspace: currentWorkspace._id 
              };
              const fallbackItemRes = await itemApi.getItems(fallbackItemParams);
              const fallbackItemList = (fallbackItemRes?.data?.items || fallbackItemRes?.items || [])
                .map((it: any) => ({ 
                  id: it._id || it.id, 
                  title: it.title || 'Untitled',
                  type: 'item' as const,
                  lastViewedAt: it.updatedAt || it.createdAt
                }));

              // Fetch recent pages by updatedAt
              const fallbackPageParams: any = { 
                limit: 10, 
                sortBy: 'updatedAt', 
                sortOrder: 'desc', 
                workspace: currentWorkspace._id 
              };
              const fallbackPageRes = await pageApi.getRecentPages(fallbackPageParams);
              const fallbackPageList = (fallbackPageRes?.data?.pages || fallbackPageRes?.pages || [])
                .map((page: any) => ({ 
                  id: page._id || page.id, 
                  title: page.title || 'Untitled Page',
                  type: 'page' as const,
                  lastViewedAt: page.updatedAt || page.createdAt
                }));

              const fallbackItems = [...fallbackItemList, ...fallbackPageList]
                .sort((a, b) => {
                  const dateA = new Date(a.lastViewedAt!);
                  const dateB = new Date(b.lastViewedAt!);
                  return dateB.getTime() - dateA.getTime();
                });

              if (mounted) setItems(fallbackItems.slice(0, 20));
            } catch (e) {
              console.error('Failed to fetch fallback recent items:', e);
              if (mounted) setItems([]);
            }
          } else {
            if (mounted) setItems(sortedItems.slice(0, 20)); // Limit to 20 most recent
          }
        }
      } catch (e) {
        console.error('Error in RecentlyVisited useEffect:', e);
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
              {(loading ? Array.from({ length: 6 }).map((_, i) => ({ id: `skeleton-${i}`, title: '', type: 'item' as const, lastViewedAt: undefined })) : items).map((item, i) => (
                <DashboardCarouselItem key={i} className="pl-4 basis-[140px]">
                  <Card 
                    className="h-24 bg-secondary flex items-end p-4 shadow-none cursor-pointer hover:bg-secondary/70"
                    onClick={() => { 
                      if (!loading) {
                        if (item.type === 'page') {
                          navigate(`/pages/${item.id}`);
                        } else {
                          navigate(`/items/${item.id}`);
                        }
                      }
                    }}
                    role="button"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {!loading && (
                        item.type === 'page' ? (
                          <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )
                      )}
                      <span className="font-medium text-sm truncate">{loading ? ' ' : item.title}</span>
                    </div>
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