<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import DashboardCard from '$lib/components/dashboard/DashboardCard.svelte';
	import BookmarkSearch from '$lib/components/bookmarks/BookmarkSearch.svelte';
	import RecentBookmarks from '$lib/components/bookmarks/RecentBookmarks.svelte';
</script>

<div class="min-h-screen p-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">dashboard</h1>
		<a href="/api/auth/logout">
			<Button variant="outline">logout</Button>
		</a>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Bookmarks Search -->
		<DashboardCard title="bookmarks" class="lg:col-span-2">
			<BookmarkSearch />
		</DashboardCard>

		<!-- Recent Bookmarks -->
		<DashboardCard title="recent" class="lg:col-span-2">
			<RecentBookmarks />
		</DashboardCard>

		<!-- Placeholder for future components -->
		<DashboardCard title="time">
			<div class="text-center text-4xl font-bold">
				{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
			</div>
		</DashboardCard>

		<DashboardCard title="todos">
			<p class="text-muted-foreground">coming soon...</p>
		</DashboardCard>
	</div>
</div>
