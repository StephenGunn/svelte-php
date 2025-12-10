CREATE TABLE `bookmark_click` (
	`id` text PRIMARY KEY NOT NULL,
	`bookmark_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`favicon` text,
	`clicked_at` integer NOT NULL
);
