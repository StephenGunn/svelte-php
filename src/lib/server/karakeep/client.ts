import { env } from '$env/dynamic/private';
import type {
	KarakeepBookmarksResponse,
	KarakeepListsResponse,
	KarakeepTagsResponse
} from '$lib/types/karakeep';

export class KarakeepClient {
	private baseUrl: string;
	private apiKey: string;

	constructor() {
		this.baseUrl = env.KARAKEEP_BASE_URL || '';
		this.apiKey = env.KARAKEEP_API_KEY || '';

		if (!this.baseUrl || !this.apiKey) {
			throw new Error('KARAKEEP_BASE_URL and KARAKEEP_API_KEY must be set');
		}
	}

	private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
		const url = new URL(`${this.baseUrl}/api/v1${endpoint}`);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value) url.searchParams.append(key, value);
			});
		}

		const response = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`Karakeep API error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	async searchBookmarks(query: string, limit = 20): Promise<KarakeepBookmarksResponse> {
		return this.fetch<KarakeepBookmarksResponse>('/bookmarks/search', {
			q: query,
			limit: limit.toString()
		});
	}

	async getBookmarks(options?: {
		archived?: boolean;
		favourited?: boolean;
		limit?: number;
		cursor?: string;
	}): Promise<KarakeepBookmarksResponse> {
		const params: Record<string, string> = {};

		if (options?.archived !== undefined) params.archived = String(options.archived);
		if (options?.favourited !== undefined) params.favourited = String(options.favourited);
		if (options?.limit) params.limit = String(options.limit);
		if (options?.cursor) params.cursor = options.cursor;

		return this.fetch<KarakeepBookmarksResponse>('/bookmarks', params);
	}

	async getLists(): Promise<KarakeepListsResponse> {
		return this.fetch<KarakeepListsResponse>('/lists');
	}

	async getTags(): Promise<KarakeepTagsResponse> {
		return this.fetch<KarakeepTagsResponse>('/tags');
	}
}

// Singleton instance
export const karakeep = new KarakeepClient();
