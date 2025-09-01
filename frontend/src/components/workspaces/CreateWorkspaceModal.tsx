import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubPanel?: boolean;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose, isSubPanel = false }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createWorkspace } = useWorkspace();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Workspace name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await createWorkspace({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      
      toast({
        title: "Success",
        description: "Workspace created successfully",
      });
      
      // Reset form and close modal
      setName('');
      setDescription('');
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create workspace",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className={cn(
      "bg-background rounded-lg shadow-lg",
      isSubPanel ? "w-full h-full" : "w-full max-w-md mx-4"
    )}>
      {!isSubPanel && (
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Create Workspace</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={cn("space-y-4", isSubPanel ? "p-4" : "p-6")}>
        <div className="space-y-2">
          <Label htmlFor="name">Workspace Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workspace name"
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description for your workspace"
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="flex-1"
          >
            {isLoading ? "Creating..." : "Create Workspace"}
          </Button>
        </div>
      </form>
    </div>
  );

  if (isSubPanel) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {content}
    </div>
  );
};

export default CreateWorkspaceModal;
