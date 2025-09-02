import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface WorkspacePermissions {
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  canCreateItems: boolean;
  canCreatePages: boolean;
  canEditItems: boolean;
  canEditPages: boolean;
  canDeleteItems: boolean;
  canDeletePages: boolean;
  canInviteMembers: boolean;
  canManageMembers: boolean;
  canManageWorkspace: boolean;
  userRole: 'view' | 'edit' | 'admin' | null;
  isOwner: boolean;
}

export const useWorkspacePermissions = (): WorkspacePermissions => {
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return {
      canView: false,
      canEdit: false,
      canAdmin: false,
      canCreateItems: false,
      canCreatePages: false,
      canEditItems: false,
      canEditPages: false,
      canDeleteItems: false,
      canDeletePages: false,
      canInviteMembers: false,
      canManageMembers: false,
      canManageWorkspace: false,
      userRole: null,
      isOwner: false,
    };
  }

  const userRole = currentWorkspace.userRole;
  const isOwner = currentWorkspace.isOwner;

  const permissions: WorkspacePermissions = {
    canView: true, // All members can view
    canEdit: userRole === 'edit' || userRole === 'admin' || isOwner,
    canAdmin: userRole === 'admin' || isOwner,
    canCreateItems: userRole === 'edit' || userRole === 'admin' || isOwner,
    canCreatePages: userRole === 'edit' || userRole === 'admin' || isOwner,
    canEditItems: userRole === 'edit' || userRole === 'admin' || isOwner,
    canEditPages: userRole === 'edit' || userRole === 'admin' || isOwner,
    canDeleteItems: userRole === 'admin' || isOwner,
    canDeletePages: userRole === 'admin' || isOwner,
    canInviteMembers: userRole === 'admin' || isOwner,
    canManageMembers: userRole === 'admin' || isOwner,
    canManageWorkspace: userRole === 'admin' || isOwner,
    userRole,
    isOwner,
  };

  return permissions;
};
