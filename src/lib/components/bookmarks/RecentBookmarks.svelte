<script lang="ts">
	import { onMount } from 'svelte';
	import { getRecentBookmarks } from '$lib/../routes/dashboard/bookmarks.remote';

	interface RecentBookmark {
		bookmarkId: string;
		url: string;
		title: string;
		favicon: string | null;
		lastClickedAt: Date;
	}

	let recentBookmarks = $state<RecentBookmark[]>([]);
	let isLoading = $state(true);

	onMount(async () => {
		try {
			recentBookmarks = await getRecentBookmarks();
		} catch (error) {
			console.error('Failed to load recent bookmarks:', error);
		} finally {
			isLoading = false;
		}
	});

	function openBookmark(bookmark: RecentBookmark) {
		window.location.href = bookmark.url;
	}
</script>

<div>
	{#if isLoading}
		<div class="grid grid-cols-5 gap-2">
			{#each Array(10) as _}
				<div class="flex flex-col items-center gap-1">
					<div class="h-8 w-8 rounded border border-border bg-muted animate-pulse"></div>
					<div class="h-2 w-12 rounded bg-muted animate-pulse"></div>
				</div>
			{/each}
		</div>
	{:else if recentBookmarks.length > 0}
		<div class="grid grid-cols-5 gap-2">
			{#each recentBookmarks as bookmark}
				<button
					onclick={() => openBookmark(bookmark)}
					class="flex flex-col items-center gap-1 group"
					title={bookmark.title}
				>
					<div
						class="h-8 w-8 rounded border border-border bg-card flex items-center justify-center transition-all hover:scale-110 hover:border-foreground"
					>
						{#if bookmark.favicon}
							<img
								src={bookmark.favicon}
								alt={bookmark.title}
								class="h-6 w-6 rounded"
								onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
							/>
						{:else}
							<div class="h-6 w-6 rounded bg-muted"></div>
						{/if}
					</div>
					<span class="text-[10px] text-muted-foreground truncate w-full text-center group-hover:text-foreground leading-tight">
						{bookmark.title}
					</span>
				</button>
			{/each}
		</div>
	{:else}
		<div class="text-center text-xs text-muted-foreground py-4">
			no recent bookmarks
		</div>
	{/if}
</div>
