import { query, command } from '$app/server';
import * as v from 'valibot';
import { desc, sql } from 'drizzle-orm';
import { karakeep } from '$lib/server/karakeep/client';
import { db } from '$lib/server/db';
import { bookmarkClick } from '$lib/server/db/schema';

// Schemas
const SearchBookmarksSchema = v.object({
	q: v.string(),
	limit: v.optional(v.number(), 20)
});

const TrackClickSchema = v.object({
	bookmarkId: v.string(),
	url: v.string(),
	title: v.string(),
	favicon: v.nullable(v.string())
});

// Query: Search bookmarks
export const searchBookmarks = query(
	SearchBookmarksSchema,
	async ({ q, limit }: v.InferOutput<typeof SearchBookmarksSchema>) => {
		const response = await karakeep.searchBookmarks(q, limit);
		return response.bookmarks;
	}
);

// Query: Get recent bookmarks
export const getRecentBookmarks = query(async () => {
	const recentBookmarks = await db
		.select({
			bookmarkId: bookmarkClick.bookmarkId,
			url: bookmarkClick.url,
			title: bookmarkClick.title,
			favicon: bookmarkClick.favicon,
			lastClickedAt: sql<Date>`MAX(${bookmarkClick.clickedAt})`
		})
		.from(bookmarkClick)
		.groupBy(bookmarkClick.bookmarkId)
		.orderBy(desc(sql`MAX(${bookmarkClick.clickedAt})`))
		.limit(10);

	return recentBookmarks;
});

// Schemas for top clicked
const TopClickedSchema = v.object({
	period: v.optional(v.picklist(['week', 'month', 'all']), 'all')
});

// Query: Get top clicked bookmarks
export const getTopClickedBookmarks = query(
	TopClickedSchema,
	async ({ period }: v.InferOutput<typeof TopClickedSchema>) => {
		let dateFilter = sql`1=1`;

		if (period === 'week') {
			dateFilter = sql`${bookmarkClick.clickedAt} >= datetime('now', '-7 days')`;
		} else if (period === 'month') {
			dateFilter = sql`${bookmarkClick.clickedAt} >= datetime('now', '-30 days')`;
		}

		const topClicked = await db
			.select({
				bookmarkId: bookmarkClick.bookmarkId,
				url: bookmarkClick.url,
				title: bookmarkClick.title,
				favicon: bookmarkClick.favicon,
				clickCount: sql<number>`COUNT(*)`
			})
			.from(bookmarkClick)
			.where(dateFilter)
			.groupBy(bookmarkClick.bookmarkId)
			.orderBy(desc(sql`COUNT(*)`))
			.limit(10);

		return topClicked;
	}
);

// Command: Track bookmark click
export const trackClick = command(
	TrackClickSchema,
	async ({ bookmarkId, url, title, favicon }: v.InferOutput<typeof TrackClickSchema>) => {
		await db.insert(bookmarkClick).values({
			bookmarkId,
			url,
			title,
			favicon,
			clickedAt: new Date()
		});
	}
);

// Query: Get all lists/folders
export const getLists = query(async () => {
	const response = await karakeep.getLists();
	return response.lists;
});

// Query: Get bookmarks by list ID
const GetBookmarksByListSchema = v.object({
	listId: v.string(),
	limit: v.optional(v.number(), 50)
});

export const getBookmarksByList = query(
	GetBookmarksByListSchema,
	async ({ listId, limit }: v.InferOutput<typeof GetBookmarksByListSchema>) => {
		const response = await karakeep.getListBookmarks(listId, { limit });
		return response.bookmarks;
	}
);
