// Karakeep API Types based on actual API responses

export interface KarakeepBookmark {
	id: string;
	createdAt: string;
	modifiedAt: string;
	title: string;
	archived: boolean;
	favourited: boolean;
	taggingStatus: string;
	summarizationStatus: string;
	note: string | null;
	summary: string | null;
	source: string;
	userId: string;
	tags: KarakeepTag[];
	content: KarakeepContent;
	assets: KarakeepAsset[];
}

export interface KarakeepContent {
	type: 'link';
	url: string;
	title: string;
	description: string;
	imageUrl: string;
	imageAssetId: string;
	screenshotAssetId: string;
	favicon: string;
	htmlContent: string | null;
	contentAssetId: string | null;
	crawledAt: string;
	author: string | null;
	publisher: string | null;
	datePublished: string | null;
	dateModified: string | null;
}

export interface KarakeepAsset {
	id: string;
	assetType: 'screenshot' | 'bannerImage' | 'linkHtmlContent';
	fileName: string | null;
}

export interface KarakeepTag {
	id: string;
	name: string;
}

export interface KarakeepList {
	id: string;
	name: string;
	description: string | null;
	icon: string;
	parentId: string | null;
	type: 'manual' | 'query';
	query: string | null;
	public: boolean;
	hasCollaborators: boolean;
	userRole: string;
}

export interface KarakeepBookmarksResponse {
	bookmarks: KarakeepBookmark[];
	nextCursor: string | null;
}

export interface KarakeepListsResponse {
	lists: KarakeepList[];
	nextCursor: string | null;
}

export interface KarakeepTagsResponse {
	tags: KarakeepTag[];
	nextCursor: string | null;
}
