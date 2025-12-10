<script lang="ts">
	import { onMount } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import type { KarakeepList, KarakeepBookmark } from '$lib/types/karakeep';
	import { getLists, getBookmarksByList, trackClick, searchBookmarks as searchBookmarksRemote } from '$lib/../routes/bookmarks.remote';

	let lists = $state<KarakeepList[]>([]);
	let currentFolder = $state<KarakeepList | null>(null);
	let currentBookmarks = $state<KarakeepBookmark[]>([]);
	let isLoading = $state(true);
	let isLoadingBookmarks = $state(false);
	let expandedFolders = $state<Set<string>>(new Set());

	// Search state
	let searchQuery = $state('');
	let searchResults = $state<KarakeepBookmark[]>([]);
	let isSearching = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;
	let isSearchMode = $state(false);

	onMount(async () => {
		try {
			lists = await getLists();

			// Expand all folders by default
			lists.forEach(folder => {
				expandedFolders.add(folder.id);
			});
			expandedFolders = new Set(expandedFolders);

			// Auto-select first root folder
			const rootLists = lists.filter(l => l.parentId === null);
			if (rootLists.length === 1) {
				await selectFolder(rootLists[0]);
			}
		} catch (error) {
			console.error('Failed to load lists:', error);
		} finally {
			isLoading = false;
		}
	});

	function getChildren(parentId: string | null): KarakeepList[] {
		return lists.filter(l => l.parentId === parentId);
	}

	async function selectFolder(folder: KarakeepList) {
		currentFolder = folder;
		isLoadingBookmarks = true;
		try {
			const result = await getBookmarksByList({ listId: folder.id });
			console.log('Loaded bookmarks for folder:', folder.name, 'Count:', result.length);
			currentBookmarks = result;
		} catch (error) {
			console.error('Failed to load bookmarks:', error);
			currentBookmarks = [];
		} finally {
			isLoadingBookmarks = false;
		}
	}

	function toggleFolder(folderId: string) {
		if (expandedFolders.has(folderId)) {
			expandedFolders.delete(folderId);
		} else {
			expandedFolders.add(folderId);
		}
		expandedFolders = new Set(expandedFolders);
	}

	async function handleBookmarkClick(e: MouseEvent, bookmark: KarakeepBookmark) {
		// Track the click but don't prevent default link behavior
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
	}

	// Search functions
	async function searchBookmarks(query: string) {
		if (!query.trim()) {
			searchResults = [];
			isSearchMode = false;
			return;
		}

		isSearching = true;
		isSearchMode = true;
		try {
			searchResults = await searchBookmarksRemote({ q: query });
		} catch (error) {
			console.error('Failed to search bookmarks:', error);
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}

	function handleSearchInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;

		// Clear search mode if query is empty
		if (!target.value.trim()) {
			isSearchMode = false;
			searchResults = [];
		}

		// Debounce search
		if (searchTimeout) clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			searchBookmarks(searchQuery);
		}, 300);
	}
</script>

{#snippet folderTree(folder: KarakeepList, depth: number)}
	{@const children = getChildren(folder.id)}
	{@const hasChildren = children.length > 0}
	{@const isExpanded = expandedFolders.has(folder.id)}

	<div>
		<button
			onclick={() => selectFolder(folder)}
			class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
			class:bg-accent={currentFolder?.id === folder.id}
			class:text-accent-foreground={currentFolder?.id === folder.id}
			style="padding-left: {depth * 0.75 + 0.5}rem;"
		>
			<span class="text-base">{folder.icon}</span>
			<span class="flex-1 text-left truncate">{folder.name}</span>
		</button>
		{#if hasChildren && isExpanded}
			{#each children as childFolder}
				{@render folderTree(childFolder, depth + 1)}
			{/each}
		{/if}
	</div>
{/snippet}

<div class="flex h-full w-full rounded-lg border border-border overflow-hidden bg-background">
	<!-- Sidebar -->
	<div class="w-64 border-r border-border overflow-y-auto flex-shrink-0">
		<div class="p-2">
			{#if isLoading}
				<div class="flex items-center justify-center py-8">
					<div class="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
				</div>
			{:else}
				{#each lists.filter(l => l.parentId === null) as rootFolder}
					{@render folderTree(rootFolder, 0)}
				{/each}
			{/if}
		</div>
	</div>

	<!-- Main content area -->
	<div class="flex-1 overflow-auto p-4">
		<!-- Search bar -->
		<div class="mb-3 relative">
			<Input
				type="search"
				placeholder="search all bookmarks..."
				value={searchQuery}
				oninput={handleSearchInput}
				class="w-full"
			/>
			{#if isSearching}
				<div class="absolute right-3 top-1/2 -translate-y-1/2">
					<div class="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
				</div>
			{/if}
		</div>

		{#if isSearchMode}
			<!-- Search results -->
			{#if searchResults.length > 0}
				<div class="space-y-2">
					{#each searchResults as bookmark}
						<a
							href={bookmark.content.url}
							onclick={(e) => handleBookmarkClick(e, bookmark)}
							class="w-full flex items-start gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent no-underline"
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
						</a>
					{/each}
				</div>
			{:else if !isSearching}
				<div class="text-center text-sm text-muted-foreground py-12">
					no bookmarks found for "{searchQuery}"
				</div>
			{/if}
		{:else}
			<!-- Folder view -->
			{#if currentFolder}
				<h2 class="mb-3 text-sm font-medium text-muted-foreground">
					{currentFolder.icon} {currentFolder.name}
				</h2>
			{/if}

			{#if isLoadingBookmarks}
				<div class="flex items-center justify-center py-8">
					<div class="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
				</div>
			{:else if currentBookmarks.length > 0}
				<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
					{#each currentBookmarks as bookmark}
						<a
							href={bookmark.content.url}
							onclick={(e) => handleBookmarkClick(e, bookmark)}
							class="flex flex-col gap-2 rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent no-underline"
						>
							<div class="flex items-start gap-2">
								{#if bookmark.content.favicon}
									<img
										src={bookmark.content.favicon}
										alt=""
										class="h-4 w-4 flex-shrink-0 rounded"
										onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
									/>
								{:else}
									<div class="h-4 w-4 flex-shrink-0 rounded bg-muted"></div>
								{/if}
								<div class="min-w-0 flex-1">
									<div class="truncate text-xs font-medium">{bookmark.title}</div>
									{#if bookmark.content.description}
										<div class="line-clamp-2 text-[10px] text-muted-foreground mt-0.5">
											{bookmark.content.description}
										</div>
									{/if}
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else if currentFolder}
				<div class="text-center text-xs text-muted-foreground py-8">
					no bookmarks in this folder
				</div>
			{:else}
				<div class="text-center text-xs text-muted-foreground py-8">
					select a folder to view bookmarks
				</div>
			{/if}
		{/if}
	</div>
</div>
