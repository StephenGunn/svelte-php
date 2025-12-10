<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { createTask, startTask, deleteTask } from '$lib/../routes/dashboard/tasks.remote';
	import { tasksStore } from '$lib/stores/tasks.svelte';

	let newTaskTitle = $state('');
	let isAdding = $state(false);

	// Reactive access to store
	let tasks = $derived(tasksStore.todoTasks);
	let isLoading = $derived(tasksStore.isLoading);

	async function handleAddTask(e: Event) {
		e.preventDefault();
		if (!newTaskTitle.trim()) return;

		const title = newTaskTitle.trim();
		newTaskTitle = '';
		isAdding = true;

		// Optimistic update - immediately add to UI
		const optimisticTask = {
			id: `temp-${Date.now()}`,
			title,
			status: 'todo' as const,
			notes: null,
			startedAt: null,
			completedAt: null,
			createdAt: new Date()
		};

		tasksStore.todoTasks = [optimisticTask, ...tasksStore.todoTasks];

		try {
			const newTask = await createTask({ title });
			// Replace optimistic task with real one
			tasksStore.todoTasks = tasksStore.todoTasks.map(t =>
				t.id === optimisticTask.id ? newTask : t
			);
		} catch (error) {
			console.error('Failed to add task:', error);
			// Remove optimistic task on error
			tasksStore.todoTasks = tasksStore.todoTasks.filter(t => t.id !== optimisticTask.id);
		} finally {
			isAdding = false;
		}
	}

	async function handleStartTask(taskId: string) {
		// Don't allow starting temp tasks
		if (taskId.startsWith('temp-')) {
			console.log('Cannot start task until it is saved');
			return;
		}

		// Find the task
		const task = tasksStore.todoTasks.find(t => t.id === taskId);
		if (!task) return;

		// Optimistic update - remove from todo list and set as current
		tasksStore.todoTasks = tasksStore.todoTasks.filter(t => t.id !== taskId);
		tasksStore.currentTask = {
			...task,
			status: 'in_progress',
			startedAt: new Date()
		};

		try {
			// Get the real task from server and set it
			const startedTask = await startTask({ taskId });
			tasksStore.currentTask = startedTask;
		} catch (error) {
			console.error('Failed to start task:', error);
			// Revert on error
			await tasksStore.refresh();
		}
	}

	async function handleDeleteTask(taskId: string) {
		// Optimistic update - remove immediately
		const previousTasks = tasksStore.todoTasks;
		tasksStore.todoTasks = tasksStore.todoTasks.filter(t => t.id !== taskId);

		try {
			await deleteTask({ taskId });
		} catch (error) {
			console.error('Failed to delete task:', error);
			// Revert on error
			tasksStore.todoTasks = previousTasks;
		}
	}
</script>

<div class="flex flex-col gap-3">
	<!-- Add task form -->
	<form onsubmit={handleAddTask} class="flex gap-2">
		<Input
			type="text"
			placeholder="add task..."
			bind:value={newTaskTitle}
			disabled={isAdding}
			class="flex-1 text-sm"
		/>
		<Button type="submit" size="sm" disabled={isAdding || !newTaskTitle.trim()}>
			add
		</Button>
	</form>

	<!-- Task list -->
	{#if isLoading}
		<div class="flex items-center justify-center py-4">
			<div class="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
		</div>
	{:else if tasks.length > 0}
		<div class="space-y-2">
			{#each tasks as task}
				<div class="flex items-center gap-2 rounded-md border border-border bg-card p-2">
					<div class="flex-1 min-w-0">
						<div class="text-xs truncate">{task.title}</div>
					</div>
					<Button
						size="sm"
						variant="ghost"
						onclick={() => handleStartTask(task.id)}
						class="h-6 px-2 text-xs"
					>
						start
					</Button>
					<button
						onclick={() => handleDeleteTask(task.id)}
						class="text-xs text-muted-foreground hover:text-destructive"
					>
						×
					</button>
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center text-xs text-muted-foreground py-4">
			no tasks yet
		</div>
	{/if}
</div>
