<script lang="ts">
	import DashboardCard from '$lib/components/dashboard/DashboardCard.svelte';
	import RecentBookmarks from '$lib/components/bookmarks/RecentBookmarks.svelte';
	import BookmarkExplorer from '$lib/components/bookmarks/BookmarkExplorer.svelte';
	import TopClickedBookmarks from '$lib/components/bookmarks/TopClickedBookmarks.svelte';
</script>

<div class="min-h-screen p-4">
	<div class="grid gap-4 xl:grid-cols-2">
		<!-- Left Column: Top Clicked and Recent/Time -->
		<div class="flex flex-col gap-4">
			<!-- Top Clicked Bookmarks -->
			<DashboardCard title="top clicked">
				<TopClickedBookmarks />
			</DashboardCard>

			<!-- Recent and Time side-by-side -->
			<div class="grid grid-cols-2 gap-4">
				<DashboardCard title="recent">
					<RecentBookmarks />
				</DashboardCard>

				<DashboardCard title="time">
					<div class="text-center text-4xl font-bold">
						{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
					</div>
				</DashboardCard>
			</div>
		</div>

		<!-- Right Column: Bookmark Explorer with Sidebar -->
		<div class="h-[800px]">
			<BookmarkExplorer />
		</div>
	</div>
</div>
