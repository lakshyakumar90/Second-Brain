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
	workspace?: string;
	isPublic?: boolean;
	collaborators?: string[];
	isFavorite?: boolean;
	isArchived?: boolean;
	parentId?: string;
};

export type UpdateItemData = Partial<CreateItemData> & { itemId: string };

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

	async getItems(params: { page?: number; limit?: number } = {}): Promise<any> {
		const query = new URLSearchParams();
		if (params.page) query.set('page', String(params.page));
		if (params.limit) query.set('limit', String(params.limit));
		const qs = query.toString();
		return this.request<any>(`/items/all${qs ? `?${qs}` : ''}`);
	}

	async getItem(itemId: string): Promise<any> {
		return this.request<any>(`/items/${itemId}`);
	}
}

export const itemApi = new ItemApiService();


