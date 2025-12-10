<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { KarakeepBookmark } from '$lib/types/karakeep';
	import { searchBookmarks as searchBookmarksRemote, trackClick } from '$lib/../routes/dashboard/bookmarks.remote';

	let searchQuery = $state('');
	let searchResults = $state<KarakeepBookmark[]>([]);
	let isSearching = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	async function searchBookmarks(query: string) {
		if (!query.trim()) {
			searchResults = [];
			return;
		}

		isSearching = true;
		try {
			searchResults = await searchBookmarksRemote({ q: query });
		} catch (error) {
			console.error('Failed to search bookmarks:', error);
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;

		// Debounce search
		if (searchTimeout) clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			searchBookmarks(searchQuery);
		}, 300);
	}

	async function handleBookmarkClick(bookmark: KarakeepBookmark) {
		// Track the click
		try {
			await trackClick({
				bookmarkId: bookmark.id,
				url: bookmark.content.url,
				title: bookmark.title,
				favicon: bookmark.content.favicon
			});
		} catch (error) {
			console.error('Failed to track click:', error);
		}

		// Open bookmark in same window
		window.location.href = bookmark.content.url;
	}
</script>

<div class="flex flex-col gap-4">
	<div class="relative">
		<Input
			type="search"
			placeholder="search bookmarks..."
			value={searchQuery}
			oninput={handleInput}
			class="w-full"
		/>
		{#if isSearching}
			<div class="absolute right-3 top-1/2 -translate-y-1/2">
				<div class="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
			</div>
		{/if}
	</div>

	{#if searchResults.length > 0}
		<div class="overflow-y-auto space-y-2" style="max-height: calc(100vh - 300px);">
			{#each searchResults as bookmark}
				<button
					onclick={() => handleBookmarkClick(bookmark)}
					class="w-full flex items-start gap-3 rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
				>
					{#if bookmark.content.favicon}
						<img
							src={bookmark.content.favicon}
							alt=""
							class="h-5 w-5 flex-shrink-0 rounded"
							onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
						/>
					{:else}
						<div class="h-5 w-5 flex-shrink-0 rounded bg-muted"></div>
					{/if}
					<div class="flex-1 min-w-0">
						<div class="font-medium text-sm truncate">{bookmark.title}</div>
						{#if bookmark.content.description}
							<div class="text-xs text-muted-foreground line-clamp-2 mt-1">
								{bookmark.content.description}
							</div>
						{/if}
						<div class="text-xs text-muted-foreground truncate mt-1">
							{bookmark.content.url}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{:else if searchQuery.trim() && !isSearching}
		<div class="text-center text-sm text-muted-foreground py-8">
			no bookmarks found for "{searchQuery}"
		</div>
	{/if}
</div>
