const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export type CreatePageData = {
	title?: string;
	content?: string;
	editorState: any;
	tags?: string[];
	categories?: string[];
	isPublic?: boolean;
	isArchived?: boolean;
};

export type UpdatePageData = Partial<CreatePageData> & { pageId: string };

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
		const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
		}
		return response.json();
	}

	async createPage(data: CreatePageData): Promise<any> {
		return this.request('/pages/create', { method: 'POST', body: JSON.stringify(data) });
	}

	async updatePage(data: UpdatePageData): Promise<any> {
		const { pageId, ...payload } = data;
		return this.request(`/pages/${pageId}`, { method: 'PUT', body: JSON.stringify(payload) });
	}

	async getPages(params: { page?: number; limit?: number } = {}): Promise<any> {
		const q = new URLSearchParams();
		if (params.page) q.set('page', String(params.page));
		if (params.limit) q.set('limit', String(params.limit));
		const qs = q.toString();
		return this.request(`/pages/all${qs ? `?${qs}` : ''}`);
	}

	async getPage(pageId: string): Promise<any> {
		return this.request(`/pages/${pageId}`);
	}
}

export const pageApi = new PageApiService();


