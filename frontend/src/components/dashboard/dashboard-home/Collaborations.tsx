import { Button } from "@/components/ui/button";
import { Users2, Clock, UserCheck, File } from "lucide-react";

// Sample collaboration data structure
const collaborationData = [
  {
    type: "shared_workspace",
    title: "Frontend Development Team",
    collaborators: ["John D.", "Sarah M.", "Mike K."],
    lastActivity: "2 hours ago",
    icon: "👥",
    status: "active"
  },
  {
    type: "shared_document",
    title: "API Documentation",
    collaborators: ["Alex R.", "Emma T."],
    lastActivity: "5 hours ago",
    icon: "📝",
    status: "active"
  },
  {
    type: "shared_workspace",
    title: "Design System Review",
    collaborators: ["Lisa P.", "Tom W.", "Anna S.", "Chris L."],
    lastActivity: "1 day ago",
    icon: "🎨",
    status: "pending"
  },
  {
    type: "shared_document",
    title: "Project Roadmap Q1 2024",
    collaborators: ["David H.", "Rachel K."],
    lastActivity: "2 days ago",
    icon: "🗺️",
    status: "active"
  }
];

const Collaborations = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "shared_workspace":
        return <Users2 className="w-3 h-3" />;
      case "shared_document":
        return <File className="w-3 h-3" />;
      default:
        return <Users2 className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Users2 className="w-3 h-3" />
          <h1 className="">Collaborations</h1>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{collaborationData.length} active</span>
        </div>
      </div>

      <div className="min-h-60 w-full bg-secondary rounded-lg p-6 flex flex-col relative overflow-hidden">
        <div className="flex-1 space-y-3">
          {collaborationData.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 hover:bg-background/50 rounded-md transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {item.collaborators.length > 2
                        ? `${item.collaborators.slice(0, 2).join(", ")} +${item.collaborators.length - 2} more`
                        : item.collaborators.join(", ")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {item.lastActivity}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}>
                <div className="w-full h-full bg-current rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Gradient overlay for blur effect */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-secondary via-secondary/80 to-transparent pointer-events-none"></div>

        {/* Expand button at bottom with blur backdrop */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pt-4">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground text-sm h-8 backdrop-blur-sm bg-background/20 border border-border/30 hover:bg-background/30 transition-all duration-200"
          >
            View All Collaborations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Collaborations;
