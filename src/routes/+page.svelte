<script lang="ts">
	import { onMount } from 'svelte';
	import DashboardCard from '$lib/components/dashboard/DashboardCard.svelte';
	import RecentBookmarks from '$lib/components/bookmarks/RecentBookmarks.svelte';
	import BookmarkExplorer from '$lib/components/bookmarks/BookmarkExplorer.svelte';
	import TopClickedBookmarks from '$lib/components/bookmarks/TopClickedBookmarks.svelte';
	import CurrentTask from '$lib/components/tasks/CurrentTask.svelte';
	import TodoList from '$lib/components/tasks/TodoList.svelte';
	import { tasksStore } from '$lib/stores/tasks.svelte';

	let reloadSignal = $state(0);

	onMount(() => {
		tasksStore.load();
	});

	function handleTrackingUpdate() {
		reloadSignal++;
	}
</script>

<div class="min-h-screen p-4">
	<div class="grid gap-4 xl:grid-cols-2">
		<!-- Left Column -->
		<div class="flex flex-col gap-4">
			<!-- Current Task (prominent) -->
			<DashboardCard title="current task">
				<CurrentTask />
			</DashboardCard>

			<!-- Todos -->
			<DashboardCard title="todos">
				<TodoList />
			</DashboardCard>

			<!-- Recent, Time, and Todos in grid -->
			<div class="grid grid-cols-2 gap-4">
				<DashboardCard title="recent">
					<RecentBookmarks reload={reloadSignal} />
				</DashboardCard>

				<DashboardCard title="time">
					<div class="text-center text-4xl font-bold">
						{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
					</div>
				</DashboardCard>
			</div>

			<!-- Placeholder cards -->
			<div class="grid grid-cols-2 gap-4">
				<DashboardCard title="calendar">
					<div class="text-center text-xs text-muted-foreground py-4">
						google calendar integration coming soon
					</div>
				</DashboardCard>

				<DashboardCard title="github">
					<div class="text-center text-xs text-muted-foreground py-4">
						github notifications coming soon
					</div>
				</DashboardCard>
			</div>

			<!-- Top Clicked Bookmarks (at bottom) -->
			<DashboardCard title="top clicked">
				<TopClickedBookmarks reload={reloadSignal} />
			</DashboardCard>
		</div>

		<!-- Right Column: Bookmark Explorer with Sidebar -->
		<div class="h-[800px]">
			<BookmarkExplorer onTrackingUpdate={handleTrackingUpdate} />
		</div>
	</div>
</div>
