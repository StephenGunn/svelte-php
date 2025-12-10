<script lang="ts">
	import { onMount } from 'svelte';
	import { getTopClickedBookmarks } from '$lib/../routes/dashboard/bookmarks.remote';

	interface TopClickedBookmark {
		bookmarkId: string;
		url: string;
		title: string;
		favicon: string | null;
		clickCount: number;
	}

	let topBookmarks = $state<TopClickedBookmark[]>([]);
	let isLoading = $state(true);
	let period = $state<'week' | 'month' | 'all'>('all');

	async function loadTopClicked() {
		isLoading = true;
		try {
			topBookmarks = await getTopClickedBookmarks({ period });
		} catch (error) {
			console.error('Failed to load top clicked bookmarks:', error);
		} finally {
			isLoading = false;
		}
	}

	onMount(async () => {
		await loadTopClicked();
	});

	$effect(() => {
		// Reload when period changes
		period;
		loadTopClicked();
	});

	function openBookmark(bookmark: TopClickedBookmark) {
		window.location.href = bookmark.url;
	}
</script>

<div class="flex flex-col gap-3">
	<!-- Period Selector -->
	<div class="flex gap-2">
		<button
			onclick={() => (period = 'week')}
			class="rounded-md px-2 py-0.5 text-xs transition-colors"
			class:bg-accent={period === 'week'}
			class:text-accent-foreground={period === 'week'}
			class:hover:bg-accent={period !== 'week'}
		>
			week
		</button>
		<button
			onclick={() => (period = 'month')}
			class="rounded-md px-2 py-0.5 text-xs transition-colors"
			class:bg-accent={period === 'month'}
			class:text-accent-foreground={period === 'month'}
			class:hover:bg-accent={period !== 'month'}
		>
			month
		</button>
		<button
			onclick={() => (period = 'all')}
			class="rounded-md px-2 py-0.5 text-xs transition-colors"
			class:bg-accent={period === 'all'}
			class:text-accent-foreground={period === 'all'}
			class:hover:bg-accent={period !== 'all'}
		>
			all time
		</button>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center py-4">
			<div class="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
		</div>
	{:else if topBookmarks.length > 0}
		<div class="space-y-1.5">
			{#each topBookmarks as bookmark, i}
				<button
					onclick={() => openBookmark(bookmark)}
					class="flex w-full items-center gap-2 rounded-md border border-border bg-card p-2 text-left transition-colors hover:bg-accent"
				>
					<span class="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
					{#if bookmark.favicon}
						<img
							src={bookmark.favicon}
							alt=""
							class="h-4 w-4 flex-shrink-0 rounded"
							onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
						/>
					{:else}
						<div class="h-4 w-4 flex-shrink-0 rounded bg-muted"></div>
					{/if}
					<div class="flex-1 min-w-0">
						<div class="truncate text-xs font-medium">{bookmark.title}</div>
					</div>
					<div class="text-xs text-muted-foreground">
						{bookmark.clickCount}
					</div>
				</button>
			{/each}
		</div>
	{:else}
		<div class="text-center text-xs text-muted-foreground py-4">
			no clicks yet
		</div>
	{/if}
</div>
