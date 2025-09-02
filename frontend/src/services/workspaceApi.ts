const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  ownerId: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  isPublic: boolean;
  allowInvites: boolean;
  settings: {
    theme: string;
    defaultView: string;
    aiEnabled: boolean;
  };
  totalItems: number;
  totalMembers: number;
  userRole: 'view' | 'edit' | 'admin';
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  userId: {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
  role: 'view' | 'edit' | 'admin';
  joinedAt: string;
  invitedBy?: {
    _id: string;
    name: string;
    username: string;
    email: string;
  };
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  isPublic?: boolean;
  allowInvites?: boolean;
  settings?: {
    theme?: string;
    defaultView?: string;
    aiEnabled?: boolean;
  };
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  allowInvites?: boolean;
  settings?: {
    theme?: string;
    defaultView?: string;
    aiEnabled?: boolean;
  };
}

export interface InviteMemberData {
  email: string;
  role: 'view' | 'edit' | 'admin';
}

class WorkspaceApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}/workspaces${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all workspaces for the current user
  async getWorkspaces(): Promise<{ message: string; workspaces: Workspace[]; total: number }> {
    return this.request<{ message: string; workspaces: Workspace[]; total: number }>('/all');
  }

  // Get a specific workspace
  async getWorkspace(workspaceId: string): Promise<{ message: string; workspace: Workspace & { members: WorkspaceMember[] } }> {
    return this.request<{ message: string; workspace: Workspace & { members: WorkspaceMember[] } }>(`/${workspaceId}`);
  }

  // Create a new workspace
  async createWorkspace(data: CreateWorkspaceData): Promise<{ message: string; workspace: Workspace }> {
    return this.request<{ message: string; workspace: Workspace }>('/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update a workspace
  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceData): Promise<{ message: string; workspace: Workspace }> {
    return this.request<{ message: string; workspace: Workspace }>(`/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete a workspace
  async deleteWorkspace(workspaceId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${workspaceId}`, {
      method: 'DELETE',
    });
  }

  // Invite a member to workspace
  async inviteMember(workspaceId: string, data: InviteMemberData): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${workspaceId}/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Remove a member from workspace
  async removeMember(workspaceId: string, userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${workspaceId}/member/${userId}`, {
      method: 'DELETE',
    });
  }

  // Update member role
  async updateMemberRole(workspaceId: string, userId: string, role: 'view' | 'edit' | 'admin'): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${workspaceId}/member/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // Get workspace members
  async getWorkspaceMembers(workspaceId: string): Promise<{ message: string; members: WorkspaceMember[] }> {
    return this.request<{ message: string; members: WorkspaceMember[] }>(`/${workspaceId}/members`);
  }

  // Accept workspace invitation
  async acceptInvite(workspaceId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${workspaceId}/accept`, {
      method: 'POST',
    });
  }

  // Reject workspace invitation
  async rejectInvite(workspaceId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${workspaceId}/reject`, {
      method: 'POST',
    });
  }

  // Leave workspace
  async leaveWorkspace(workspaceId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${workspaceId}/leave`, {
      method: 'POST',
    });
  }
}

export const workspaceApi = new WorkspaceApiService();
