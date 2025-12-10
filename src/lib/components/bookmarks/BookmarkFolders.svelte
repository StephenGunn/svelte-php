<script lang="ts">
	import { onMount } from 'svelte';
	import type { KarakeepList, KarakeepBookmark } from '$lib/types/karakeep';
	import { getLists, getBookmarksByList, trackClick } from '$lib/../routes/bookmarks.remote';

	let lists = $state<KarakeepList[]>([]);
	let currentPath = $state<KarakeepList[]>([]);
	let currentBookmarks = $state<KarakeepBookmark[]>([]);
	let isLoading = $state(true);
	let isLoadingBookmarks = $state(false);

	onMount(async () => {
		try {
			lists = await getLists();

			// If there's only one root folder, auto-expand into it
			const rootLists = lists.filter(l => l.parentId === null);
			if (rootLists.length === 1) {
				currentPath = [rootLists[0]];
				await loadCurrentFolderBookmarks();
			}
		} catch (error) {
			console.error('Failed to load lists:', error);
		} finally {
			isLoading = false;
		}
	});

	// Get children of current folder
	const currentChildren = $derived(() => {
		const currentId = currentPath[currentPath.length - 1]?.id ?? null;
		return lists.filter((list) => list.parentId === currentId);
	});

	// Navigate into a folder
	async function navigateToFolder(list: KarakeepList) {
		currentPath = [...currentPath, list];
		await loadCurrentFolderBookmarks();
	}

	// Load bookmarks for the current folder
	async function loadCurrentFolderBookmarks() {
		const currentFolder = currentPath[currentPath.length - 1];
		if (!currentFolder) {
			currentBookmarks = [];
			return;
		}

		isLoadingBookmarks = true;
		try {
			currentBookmarks = await getBookmarksByList({ listId: currentFolder.id });
		} catch (error) {
			console.error('Failed to load bookmarks:', error);
			currentBookmarks = [];
		} finally {
			isLoadingBookmarks = false;
		}
	}

	// Navigate to a specific breadcrumb level
	async function navigateToBreadcrumb(index: number) {
		if (index === -1) {
			// Go to root
			currentPath = [];
			currentBookmarks = [];
		} else {
			currentPath = currentPath.slice(0, index + 1);
			await loadCurrentFolderBookmarks();
		}
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
	<!-- Breadcrumbs -->
	{#if currentPath.length > 0}
		<nav class="flex items-center gap-2 text-sm text-muted-foreground">
			<button onclick={() => navigateToBreadcrumb(-1)} class="hover:text-foreground">
				home
			</button>
			{#each currentPath as folder, i}
				<span>/</span>
				<button
					onclick={() => navigateToBreadcrumb(i)}
					class="hover:text-foreground"
					class:text-foreground={i === currentPath.length - 1}
				>
					{folder.icon} {folder.name}
				</button>
			{/each}
		</nav>
	{/if}

	{#if isLoading}
		<div class="flex items-center justify-center py-8">
			<div class="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
		</div>
	{:else if isLoadingBookmarks}
		<div class="flex items-center justify-center py-8">
			<div class="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
		</div>
	{:else}
		<!-- Show folders AND bookmarks together -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			<!-- Child folders first -->
			{#each currentChildren() as list}
				<button
					onclick={() => navigateToFolder(list)}
					class="flex items-center gap-3 rounded-md border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
				>
					<span class="text-2xl">{list.icon}</span>
					<div class="min-w-0 flex-1">
						<div class="truncate font-medium">{list.name}</div>
						{#if list.description}
							<div class="truncate text-xs text-muted-foreground">{list.description}</div>
						{/if}
					</div>
				</button>
			{/each}

			<!-- Bookmarks in current folder -->
			{#each currentBookmarks as bookmark}
				<button
					onclick={() => handleBookmarkClick(bookmark)}
					class="flex flex-col gap-2 rounded-md border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
				>
					<div class="flex items-start gap-2">
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
						<div class="min-w-0 flex-1">
							<div class="truncate text-sm font-medium">{bookmark.title}</div>
							{#if bookmark.content.description}
								<div class="line-clamp-2 text-xs text-muted-foreground mt-1">
									{bookmark.content.description}
								</div>
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>

		{#if currentChildren().length === 0 && currentBookmarks.length === 0}
			<div class="text-center text-sm text-muted-foreground py-8">
				this folder is empty
			</div>
		{/if}
	{/if}
</div>
