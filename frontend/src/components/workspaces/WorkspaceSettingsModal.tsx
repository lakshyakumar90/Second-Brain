import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubPanel?: boolean;
}

const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({ isOpen, onClose, isSubPanel = false }) => {
  const { currentWorkspace, updateWorkspace, deleteWorkspace } = useWorkspace();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [allowInvites, setAllowInvites] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form with current workspace data
  useEffect(() => {
    if (currentWorkspace) {
      setName(currentWorkspace.name);
      setDescription(currentWorkspace.description || '');
      setIsPublic(currentWorkspace.isPublic);
      setAllowInvites(currentWorkspace.allowInvites);
    }
  }, [currentWorkspace]);

  const handleSave = async () => {
    if (!currentWorkspace) return;
    
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
      await updateWorkspace(currentWorkspace._id, {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
        allowInvites,
      });
      
      toast({
        title: "Success",
        description: "Workspace settings updated successfully",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update workspace settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentWorkspace) return;

    try {
      setIsDeleting(true);
      await deleteWorkspace(currentWorkspace._id);
      
      toast({
        title: "Success",
        description: "Workspace deleted successfully",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete workspace",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isDeleting) {
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
            <h2 className="text-lg font-semibold">Workspace Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading || isDeleting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className={cn("space-y-4", isSubPanel ? "p-4" : "p-6")}>
        <div className="space-y-2">
          <Label htmlFor="name">Workspace Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workspace name"
            disabled={isLoading || isDeleting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description for your workspace"
            disabled={isLoading || isDeleting}
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Public Workspace</Label>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isLoading || isDeleting}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Allow Invites</Label>
            <Switch
              checked={allowInvites}
              onCheckedChange={setAllowInvites}
              disabled={isLoading || isDeleting}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isDeleting || !name.trim()}
            className="flex-1"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Workspace"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{currentWorkspace?.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
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

export default WorkspaceSettingsModal;
