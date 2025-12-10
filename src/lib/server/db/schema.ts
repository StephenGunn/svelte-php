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

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	status: text('status', { enum: ['todo', 'in_progress', 'done'] })
		.notNull()
		.default('todo'),
	notes: text('notes'),
	startedAt: integer('started_at', { mode: 'timestamp' }),
	completedAt: integer('completed_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});
