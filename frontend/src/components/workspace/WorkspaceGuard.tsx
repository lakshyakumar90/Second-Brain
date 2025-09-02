import React from 'react';
import { useWorkspaceGuard } from '@/hooks/useWorkspaceGuard';
import { Loader2 } from 'lucide-react';

interface WorkspaceGuardProps {
  children: React.ReactNode;
  type: 'page' | 'item';
  redirectOnInvalid?: boolean;
  fallback?: React.ReactNode;
}

const WorkspaceGuard: React.FC<WorkspaceGuardProps> = ({ 
  children, 
  type, 
  redirectOnInvalid = true,
  fallback 
}) => {
  const { isValidating, isValid, currentWorkspace } = useWorkspaceGuard({ 
    type, 
    redirectOnInvalid 
  });

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-muted-foreground">Validating workspace access...</span>
        </div>
      </div>
    );
  }

  // Show fallback or error state if not valid
  if (!isValid) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have access to this {type} in the current workspace.
          </p>
          {currentWorkspace && (
            <p className="text-sm text-muted-foreground mt-2">
              Current workspace: {currentWorkspace.name}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Render children if validation passes
  return <>{children}</>;
};

export default WorkspaceGuard;
