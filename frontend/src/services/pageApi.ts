const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface PageAttachment {
	_id: string;
	originalName: string;
	filename: string;
	url: string;
	publicId: string;
	size: number;
	mimetype: string;
	uploadedAt: string;
	uploadedBy: string;
}

export type CreatePageData = {
	title?: string;
	content?: string; // Optional - will be auto-generated from editorState
	editorState: any;
	summary?: string; // Optional - will be auto-generated from content
	tags?: string[];
	categories?: string[];
	workspace: string; // Required
	isPublic?: boolean;
	isArchived?: boolean;
};

export type UpdatePageData = Partial<Omit<CreatePageData, 'workspace'>> & { pageId: string; workspace?: string };

class PageApiService {
	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const config: RequestInit = {
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
			credentials: 'include',
			...options,
		};
		
		console.log('PageApi request:', { endpoint, config });
		
		try {
			const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
			console.log('PageApi response:', { status: response.status, statusText: response.statusText });
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error('PageApi error response:', errorData);
				throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
			}
			return response.json();
		} catch (error) {
			console.error('PageApi request error:', error);
			// Handle network errors (connection refused, no internet, etc.)
			if (error instanceof TypeError && error.message.includes('fetch')) {
				throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
			}
			// Re-throw other errors
			throw error;
		}
	}

	async createPage(data: CreatePageData): Promise<any> {
		return this.request('/pages/create', { method: 'POST', body: JSON.stringify(data) });
	}

	async updatePage(data: UpdatePageData): Promise<any> {
		const { pageId, workspace, ...payload } = data;
		const q = new URLSearchParams();
		if (workspace) q.set('workspace', workspace);
		const qs = q.toString();
		return this.request(`/pages/${pageId}${qs ? `?${qs}` : ''}`, { method: 'PUT', body: JSON.stringify(payload) });
	}

	async getPages(params: { page?: number; limit?: number; workspace: string }): Promise<any> {
		const q = new URLSearchParams();
		if (params.page) q.set('page', String(params.page));
		if (params.limit) q.set('limit', String(params.limit));
		q.set('workspace', params.workspace);
		const qs = q.toString();
		return this.request(`/pages/all${qs ? `?${qs}` : ''}`);
	}

	async getRecentPages(params: { limit?: number; workspace: string; sortBy?: string; sortOrder?: string }): Promise<any> {
		const q = new URLSearchParams();
		if (params.limit) q.set('limit', String(params.limit));
		if (params.sortBy) q.set('sortBy', params.sortBy);
		if (params.sortOrder) q.set('sortOrder', params.sortOrder);
		q.set('workspace', params.workspace);
		const qs = q.toString();
		return this.request(`/pages/all${qs ? `?${qs}` : ''}`);
	}

	async getPage(pageId: string, workspace: string): Promise<any> {
		const q = new URLSearchParams();
		q.set('workspace', workspace);
		const qs = q.toString();
		return this.request(`/pages/${pageId}${qs ? `?${qs}` : ''}`);
	}

	async deletePage(pageId: string, workspace: string): Promise<any> {
		const q = new URLSearchParams();
		q.set('workspace', workspace);
		const qs = q.toString();
		return this.request(`/pages/${pageId}${qs ? `?${qs}` : ''}`, { method: 'DELETE' });
	}
}

export const pageApi = new PageApiService();


