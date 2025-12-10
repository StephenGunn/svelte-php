<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { pauseTask, completeTask } from '$lib/../routes/dashboard/tasks.remote';
	import { tasksStore } from '$lib/stores/tasks.svelte';

	let elapsedTime = $state('00:00:00');
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	// Reactive access to store
	let currentTask = $derived(tasksStore.currentTask);
	let isLoading = $derived(tasksStore.isLoading);

	onMount(() => {
		startTimer();
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	function startTimer() {
		if (timerInterval) clearInterval(timerInterval);

		timerInterval = setInterval(() => {
			if (currentTask?.startedAt) {
				const start = new Date(currentTask.startedAt).getTime();
				const now = Date.now();
				const diff = now - start;

				const minutes = Math.floor(diff / (1000 * 60));
				const hours = Math.floor(minutes / 60);
				const days = Math.floor(hours / 24);

				if (days > 0) {
					elapsedTime = days === 1 ? '1 day' : `${days} days`;
				} else if (hours > 0) {
					elapsedTime = hours === 1 ? '1 hour' : `${hours} hours`;
				} else if (minutes > 0) {
					elapsedTime = minutes === 1 ? '1 minute' : `${minutes} minutes`;
				} else {
					elapsedTime = 'just started';
				}
			} else {
				elapsedTime = 'not started';
			}
		}, 1000);
	}

	async function handlePause() {
		if (!currentTask) return;

		const task = currentTask;

		// Optimistic update - clear current and add back to todos
		tasksStore.currentTask = null;
		tasksStore.todoTasks = [
			{ ...task, status: 'todo', startedAt: null },
			...tasksStore.todoTasks
		];

		try {
			await pauseTask({ taskId: task.id });
		} catch (error) {
			console.error('Failed to pause task:', error);
			// Revert on error
			await tasksStore.refresh();
		}
	}

	async function handleComplete() {
		if (!currentTask) return;

		const taskId = currentTask.id;

		// Optimistic update - just clear current task
		tasksStore.currentTask = null;

		try {
			await completeTask({ taskId });
			// Task is done, we don't need to do anything else
		} catch (error) {
			console.error('Failed to complete task:', error);
			// Revert on error
			await tasksStore.refresh();
		}
	}
</script>

{#if isLoading}
	<div class="flex items-center justify-center py-8">
		<div class="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
	</div>
{:else if currentTask}
	<div class="flex flex-col gap-3">
		<div class="text-center">
			<div class="text-xl font-bold">{currentTask.title}</div>
			{#if currentTask.notes}
				<div class="text-xs text-muted-foreground mt-1">{currentTask.notes}</div>
			{/if}
		</div>

		<div class="text-center">
			<div class="text-xs text-muted-foreground">{elapsedTime}</div>
		</div>

		<div class="flex gap-2">
			<Button variant="outline" size="sm" onclick={handlePause} class="flex-1">
				pause
			</Button>
			<Button size="sm" onclick={handleComplete} class="flex-1">
				done
			</Button>
		</div>
	</div>
{:else}
	<div class="text-center text-xs text-muted-foreground py-4">
		no active task
	</div>
{/if}
