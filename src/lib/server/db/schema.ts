import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	age: integer('age')
});

export const bookmarkClick = sqliteTable('bookmark_click', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	bookmarkId: text('bookmark_id').notNull(), // Karakeep bookmark ID
	url: text('url').notNull(),
	title: text('title').notNull(),
	favicon: text('favicon'),
	clickedAt: integer('clicked_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});
