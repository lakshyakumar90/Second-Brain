import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { workspaceApi, type Workspace } from '@/services/workspaceApi';
import { useAppSelector } from '@/store/hooks';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (data: { name: string; description?: string }) => Promise<void>;
  updateWorkspace: (workspaceId: string, data: any) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const loadWorkspaces = async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await workspaceApi.getWorkspaces();
      setWorkspaces(response.workspaces);
      
      // Set current workspace to the first one or the one from localStorage
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      const workspaceToSet = savedWorkspaceId 
        ? response.workspaces.find(w => w._id === savedWorkspaceId)
        : response.workspaces[0];
      
      if (workspaceToSet) {
        setCurrentWorkspace(workspaceToSet);
        localStorage.setItem('currentWorkspaceId', workspaceToSet._id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load workspaces');
      console.error('Error loading workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.find(w => w._id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);
    }
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  const createWorkspace = async (data: { name: string; description?: string }) => {
    try {
      const response = await workspaceApi.createWorkspace(data);
      await refreshWorkspaces();
      
      // Switch to the newly created workspace
      if (response.workspace) {
        await switchWorkspace(response.workspace._id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
      throw err;
    }
  };

  const updateWorkspace = async (workspaceId: string, data: any) => {
    try {
      await workspaceApi.updateWorkspace(workspaceId, data);
      await refreshWorkspaces();
    } catch (err: any) {
      setError(err.message || 'Failed to update workspace');
      throw err;
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      await workspaceApi.deleteWorkspace(workspaceId);
      await refreshWorkspaces();
      
      // If we deleted the current workspace, switch to the first available one
      if (currentWorkspace?._id === workspaceId) {
        const remainingWorkspaces = workspaces.filter(w => w._id !== workspaceId);
        if (remainingWorkspaces.length > 0) {
          await switchWorkspace(remainingWorkspaces[0]._id);
        } else {
          setCurrentWorkspace(null);
          localStorage.removeItem('currentWorkspaceId');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete workspace');
      throw err;
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, [isAuthenticated]);

  const value: WorkspaceContextType = {
    workspaces,
    currentWorkspace,
    isLoading,
    error,
    switchWorkspace,
    refreshWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
