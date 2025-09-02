import React from 'react';
import { useWorkspacePermissions } from '@/hooks/useWorkspacePermissions';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Edit3, Crown } from 'lucide-react';

const UserRoleDisplay: React.FC = () => {
  const permissions = useWorkspacePermissions();

  if (!permissions.userRole) {
    return null;
  }

  const getRoleConfig = () => {
    if (permissions.isOwner) {
      return {
        label: 'Owner',
        icon: Crown,
        variant: 'default' as const,
        color: 'text-amber-600',
      };
    }

    switch (permissions.userRole) {
      case 'admin':
        return {
          label: 'Admin',
          icon: Shield,
          variant: 'secondary' as const,
          color: 'text-blue-600',
        };
      case 'edit':
        return {
          label: 'Editor',
          icon: Edit3,
          variant: 'outline' as const,
          color: 'text-green-600',
        };
      case 'view':
        return {
          label: 'Viewer',
          icon: Eye,
          variant: 'outline' as const,
          color: 'text-gray-600',
        };
      default:
        return null;
    }
  };

  const config = getRoleConfig();
  if (!config) return null;

  const { label, icon: Icon, variant, color } = config;

  return (
    <Badge variant={variant} className="flex items-center gap-1 text-xs">
      <Icon className={`h-3 w-3 ${color}`} />
      {label}
    </Badge>
  );
};

export default UserRoleDisplay;
