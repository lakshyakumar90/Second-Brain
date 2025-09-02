import React, { useState, useEffect } from 'react';
import { X, Users, Crown, Shield, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { workspaceApi, type WorkspaceMember } from '@/services/workspaceApi';
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

interface WorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubPanel?: boolean;
}

const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({ isOpen, onClose, isSubPanel = false }) => {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'view' | 'edit' | 'admin'>('view');
  const [isInviting, setIsInviting] = useState(false);

  const loadMembers = async () => {
    if (!currentWorkspace) return;
    
    try {
      setIsLoading(true);
      const response = await workspaceApi.getWorkspaceMembers(currentWorkspace._id);
      setMembers(response.members);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentWorkspace) {
      loadMembers();
    }
  }, [isOpen, currentWorkspace]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (!currentWorkspace) return;

    try {
      setIsInviting(true);
      await workspaceApi.inviteMember(currentWorkspace._id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      
      setInviteEmail('');
      setInviteRole('view');
      await loadMembers(); // Refresh members list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentWorkspace) return;

    try {
      await workspaceApi.removeMember(currentWorkspace._id, memberId);
      
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
      
      await loadMembers(); // Refresh members list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: 'view' | 'edit' | 'admin') => {
    if (!currentWorkspace) return;

    try {
      await workspaceApi.updateMemberRole(currentWorkspace._id, memberId, newRole);
      
      toast({
        title: "Success",
        description: "Member role updated successfully",
      });
      
      await loadMembers(); // Refresh members list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'edit':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'edit':
        return 'Editor';
      case 'view':
        return 'Viewer';
      default:
        return role;
    }
  };

  const handleClose = () => {
    if (!isInviting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className={cn(
      "bg-background rounded-lg shadow-lg",
      isSubPanel ? "w-full h-full" : "w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
    )}>
      {!isSubPanel && (
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Manage Members</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isInviting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className={cn("space-y-6", isSubPanel ? "p-4" : "p-6")}>
        {/* Invite Member Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Invite New Member</h3>
          <form onSubmit={handleInviteMember} className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  disabled={isInviting}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-32">
                <Label htmlFor="role" className="text-xs">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value: 'view' | 'edit' | 'admin') => setInviteRole(value)}
                  disabled={isInviting}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[10010] workspace-portal">
                    <SelectItem value="view">Viewer</SelectItem>
                    <SelectItem value="edit">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isInviting || !inviteEmail.trim()}
              className="w-full h-8 text-sm"
            >
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </form>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Current Members</h3>
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No members found
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.userId._id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {member.userId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{member.userId.name}</div>
                      <div className="text-xs text-muted-foreground">{member.userId.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      <span className="text-xs text-muted-foreground">
                        {getRoleLabel(member.role)}
                      </span>
                    </div>
                    {member.userId._id !== currentWorkspace?.ownerId?._id && (
                      <div className="flex items-center gap-1">
                        <Select
                          value={member.role}
                          onValueChange={(value: 'view' | 'edit' | 'admin') => {
                            console.log('Role change requested:', { userId: member.userId._id, newRole: value });
                            handleUpdateMemberRole(member.userId._id, value);
                          }}
                        >
                          <SelectTrigger className="h-6 w-20 text-xs">
                            <SelectValue placeholder={getRoleLabel(member.role)} />
                          </SelectTrigger>
                          <SelectContent position="popper" className="z-[10010] workspace-portal">
                            <SelectItem value="view">Viewer</SelectItem>
                            <SelectItem value="edit">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.userId.name} from this workspace?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.userId._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default WorkspaceMembersModal;
