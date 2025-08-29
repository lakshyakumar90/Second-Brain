import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Mail, Crown, Shield, Eye } from 'lucide-react';
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
}

const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({ isOpen, onClose }) => {
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

  const handleRemoveMember = async (userId: string) => {
    if (!currentWorkspace) return;

    try {
      await workspaceApi.removeMember(currentWorkspace._id, userId);
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

  const handleUpdateRole = async (userId: string, newRole: 'view' | 'edit' | 'admin') => {
    if (!currentWorkspace) return;

    try {
      await workspaceApi.updateMemberRole(currentWorkspace._id, userId, newRole);
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
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'edit':
        return 'Editor';
      default:
        return 'Viewer';
    }
  };

  if (!isOpen || !currentWorkspace) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Workspace Members</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invite New Member */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </h3>
            <form onSubmit={handleInviteMember} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    disabled={isInviting}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(value: 'view' | 'edit' | 'admin') => setInviteRole(value)}
                    disabled={isInviting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">Viewer</SelectItem>
                      <SelectItem value="edit">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full"
              >
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </div>

          {/* Members List */}
          <div>
            <h3 className="font-medium mb-3">Current Members ({members.length})</h3>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.userId._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {member.userId.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{member.userId.name}</div>
                        <div className="text-sm text-muted-foreground">{member.userId.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        <span className="text-sm">{getRoleLabel(member.role)}</span>
                      </div>
                      
                      {currentWorkspace.isOwner && member.userId._id !== currentWorkspace.ownerId._id && (
                        <div className="flex items-center gap-1">
                          <Select
                            value={member.role}
                            onValueChange={(value: 'view' | 'edit' | 'admin') => 
                              handleUpdateRole(member.userId._id, value)
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">Viewer</SelectItem>
                              <SelectItem value="edit">Editor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                Remove
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
                                  className="bg-red-500 text-white hover:bg-red-600"
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
                
                {members.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No members found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMembersModal;
