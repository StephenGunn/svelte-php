<script lang="ts">
	import { getBookmarksByList, trackClick } from '$lib/../routes/bookmarks.remote';
	import type { KarakeepBookmark } from '$lib/types/karakeep';

	const LIST_ID = 'kb532rxcftxgpluykibia0gx';

	let bookmarks = $state<KarakeepBookmark[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function loadBookmarks() {
		loading = true;
		error = null;
		try {
			bookmarks = await getBookmarksByList({ listId: LIST_ID, limit: 100 });
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load bookmarks';
			console.error('Failed to load bookmarks:', e);
		} finally {
			loading = false;
		}
	}

	async function handleClick(bookmark: KarakeepBookmark) {
		try {
			await trackClick({
				bookmarkId: bookmark.id,
				url: bookmark.content.url,
				title: bookmark.content.title,
				favicon: bookmark.content.favicon
			});
		} catch (e) {
			console.error('Failed to track click:', e);
		}
		window.open(bookmark.content.url, '_blank');
	}

	loadBookmarks();
</script>

<div class="w-full">
	{#if loading}
		<div class="grid grid-cols-4 gap-3 p-4 sm:grid-cols-5 lg:grid-cols-6">
			{#each Array(12) as _}
				<div class="flex flex-col items-center gap-1">
					<div class="h-[50px] w-[50px] animate-pulse rounded-2xl bg-muted"></div>
					<div class="h-3 w-12 animate-pulse rounded bg-muted"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="p-4 text-center text-sm text-muted-foreground">
			<p>Error loading bookmarks: {error}</p>
		</div>
	{:else if bookmarks.length === 0}
		<div class="p-4 text-center text-sm text-muted-foreground">
			<p>No bookmarks found</p>
		</div>
	{:else}
		<div class="grid grid-cols-4 gap-3 p-4 sm:grid-cols-5 lg:grid-cols-6">
			{#each bookmarks as bookmark (bookmark.id)}
				<button
					onclick={() => handleClick(bookmark)}
					class="group flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95"
				>
					<div
						class="flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/50 shadow-lg transition-shadow group-hover:shadow-xl"
					>
						{#if bookmark.content.favicon}
							<img
								src={bookmark.content.favicon}
								alt=""
								class="h-8 w-8 object-contain"
								onerror={(e) => {
									const target = e.currentTarget as HTMLImageElement;
									target.style.display = 'none';
									const fallback = target.nextElementSibling as HTMLElement;
									if (fallback) fallback.style.display = 'flex';
								}}
							/>
							<div
								class="hidden h-8 w-8 items-center justify-center text-xl text-muted-foreground"
							>
								🔗
							</div>
						{:else}
							<div class="flex h-8 w-8 items-center justify-center text-xl text-muted-foreground">
								🔗
							</div>
						{/if}
					</div>
					<span
						class="max-w-full truncate text-xs font-medium text-foreground transition-colors group-hover:text-primary"
					>
						{bookmark.content.title || bookmark.content.url}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
