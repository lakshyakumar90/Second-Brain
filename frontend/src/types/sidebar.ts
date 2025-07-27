export interface WorkspaceItem {
  id: string;
  name: string;
  emoji: string;
  isOwner: boolean;
  memberCount: number;
  description?: string;
  isPublic?: boolean;
  settings?: {
    theme: string;
    defaultView: string;
    aiEnabled: boolean;
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  description?: string;
  isDefault?: boolean;
  parentId?: string;
}

export interface SidebarSection {
  id: string;
  label: string;
  isExpanded: boolean;
  hasAddButton?: boolean;
  items?: SidebarMenuItem[];
}

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  count?: number;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  initials: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export type SidebarState = 'collapsed' | 'shrunk' | 'expanded';

export type ContentType = 'text' | 'image' | 'video' | 'link' | 'document' | 'audio';

export interface ItemCount {
  type: ContentType;
  count: number;
} 