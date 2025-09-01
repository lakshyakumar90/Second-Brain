const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export type Block = {
	id: string;
	type: 'text' | 'heading' | 'code' | 'todo' | 'checklist';
	content: string | string[] | null;
	checked?: boolean;
	children?: Block[];
};

export type CreateItemData = {
	type: 'text' | 'image' | 'video' | 'link' | 'document' | 'audio';
	title: string;
	content?: string;
	blocks?: Block[];
	url?: string;
	metadata?: Record<string, unknown>;
	categories?: string[];
	tags?: string[];
	workspace: string; // Required
	isPublic?: boolean;
	collaborators?: string[];
	isFavorite?: boolean;
	isArchived?: boolean;
	parentId?: string;
};

// Allow aiData for updates (to store AI-generated summary, etc.)
export type UpdateItemData = Partial<CreateItemData> & { 
	itemId: string;
	aiData?: { summary?: string };
};

export class ItemApiService {
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

	async createItem(data: CreateItemData): Promise<any> {
		return this.request<any>('/items/create', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateItem(data: UpdateItemData): Promise<any> {
		const { itemId, ...payload } = data;
		return this.request<any>(`/items/${itemId}`, {
			method: 'PUT',
			body: JSON.stringify(payload),
		});
	}

	async getItems(params: {
		page?: number;
		limit?: number;
		type?: 'text' | 'image' | 'video' | 'link' | 'document' | 'audio';
		isPublic?: boolean;
		isFavorite?: boolean;
		isArchived?: boolean;
		search?: string;
		tags?: string[] | string;
		categories?: string[] | string;
		workspace: string; // Required
		socialPlatform?: 'twitter' | 'instagram' | 'youtube' | 'linkedin' | 'tiktok' | 'reddit' | 'pinterest';
		sentiment?: 'positive' | 'negative' | 'neutral';
		complexity?: 'low' | 'medium' | 'high';
		dateFrom?: string; // ISO string
		dateTo?: string; // ISO string
		sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'viewCount' | 'lastViewedAt' | 'lastEditedAt';
		sortOrder?: 'asc' | 'desc';
	}): Promise<any> {
		const query = new URLSearchParams();
		const setIf = (key: string, value: any) => {
			if (value !== undefined && value !== null && value !== '') {
				query.set(key, String(value));
			}
		};
		setIf('page', params.page);
		setIf('limit', params.limit);
		setIf('type', params.type);
		if (params.isPublic !== undefined) setIf('isPublic', params.isPublic);
		if (params.isFavorite !== undefined) setIf('isFavorite', params.isFavorite);
		if (params.isArchived !== undefined) setIf('isArchived', params.isArchived);
		setIf('search', params.search);
		if (params.tags) {
			const tags = Array.isArray(params.tags) ? params.tags.join(',') : params.tags;
			setIf('tags', tags);
		}
		if (params.categories) {
			const cats = Array.isArray(params.categories) ? params.categories.join(',') : params.categories;
			setIf('categories', cats);
		}
		setIf('workspace', params.workspace);
		setIf('socialPlatform', params.socialPlatform);
		setIf('sentiment', params.sentiment);
		setIf('complexity', params.complexity);
		setIf('dateFrom', params.dateFrom);
		setIf('dateTo', params.dateTo);
		setIf('sortBy', params.sortBy);
		setIf('sortOrder', params.sortOrder);
		const qs = query.toString();
		return this.request<any>(`/items/all${qs ? `?${qs}` : ''}`);
	}

	async getItem(itemId: string): Promise<any> {
		return this.request<any>(`/items/${itemId}`);
	}
}

export const itemApi = new ItemApiService();


