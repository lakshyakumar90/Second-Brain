const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export type CommentPosition = {
  start?: number;
  end?: number;
  selectedText?: string;
};

export type CreateCommentData = {
  itemId?: string;
  pageId?: string;
  content: string;
  position?: CommentPosition;
};

export type UpdateCommentData = {
  content: string;
};

export type CommentReaction = {
  userId: string;
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  createdAt: Date;
};

export type Comment = {
  _id: string;
  itemId?: string;
  pageId?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  parentId?: {
    _id: string;
    content: string;
  };
  replies: Array<{
    _id: string;
    content: string;
  }>;
  isResolved: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  reactions: CommentReaction[];
  position?: CommentPosition;
  createdAt: Date;
  updatedAt: Date;
};

export type GetCommentsParams = {
  itemId?: string;
  pageId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

export class CommentApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}/comments${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async createComment(data: CreateCommentData): Promise<{ message: string; comment: Comment }> {
    // Only include itemId or pageId, not both, and exclude undefined values
    const cleanData: any = {
      content: data.content,
    };
    
    if (data.itemId) {
      cleanData.itemId = data.itemId;
    } else if (data.pageId) {
      cleanData.pageId = data.pageId;
    }
    
    if (data.position) {
      cleanData.position = data.position;
    }
    
    return this.request<{ message: string; comment: Comment }>('', {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  }

  async getComments(params: GetCommentsParams): Promise<{
    message: string;
    comments: Comment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalComments: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const query = new URLSearchParams();
    
    // Only include itemId or pageId, not both
    if (params.itemId) {
      query.set('itemId', params.itemId);
    } else if (params.pageId) {
      query.set('pageId', params.pageId);
    }
    
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    
    const qs = query.toString();
    return this.request<{
      message: string;
      comments: Comment[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalComments: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(`?${qs}`);
  }

  async getComment(commentId: string): Promise<{ message: string; comment: Comment }> {
    return this.request<{ message: string; comment: Comment }>(`/${commentId}`);
  }

  async updateComment(commentId: string, data: UpdateCommentData): Promise<{ message: string; comment: Comment }> {
    return this.request<{ message: string; comment: Comment }>(`/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteComment(commentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${commentId}`, {
      method: 'DELETE',
    });
  }



  async addReaction(commentId: string, reactionType: CommentReaction['type']): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${commentId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ type: reactionType }),
    });
  }

  async removeReaction(commentId: string, reactionType: CommentReaction['type']): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${commentId}/reaction`, {
      method: 'DELETE',
      body: JSON.stringify({ type: reactionType }),
    });
  }

  async resolveComment(commentId: string): Promise<{ message: string; comment: Comment }> {
    return this.request<{ message: string; comment: Comment }>(`/${commentId}/resolve`, {
      method: 'PATCH',
    });
  }

  async getCommentsCount(itemId?: string, pageId?: string): Promise<{ count: number }> {
    const params: GetCommentsParams = { limit: 1 };
    
    if (itemId) {
      params.itemId = itemId;
    } else if (pageId) {
      params.pageId = pageId;
    }
    
    const result = await this.getComments(params);
    return { count: result.pagination.totalComments };
  }
}

export const commentApi = new CommentApiService();
