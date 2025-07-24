import { Button } from "@/components/ui/button";
import { Plus, SquareLibrary } from "lucide-react";

const NewCreation = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <SquareLibrary className="w-5 text-muted-foreground" />
          <h1 className="text-sm text-muted-foreground">
            Ready to make today productive ?
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-30 flex items-center justify-center w-full bg-secondary rounded-lg">
          <Button variant="outline" className="">
            <Plus className="w-4 h-4" />
            <span>New Creation</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewCreation;
