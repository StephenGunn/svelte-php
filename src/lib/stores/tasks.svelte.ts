import { getTasks, getCurrentTask } from '$lib/../routes/dashboard/tasks.remote';

interface Task {
	id: string;
	title: string;
	status: 'todo' | 'in_progress' | 'done';
	notes: string | null;
	startedAt: Date | null;
	completedAt: Date | null;
	createdAt: Date;
}

class TasksStore {
	currentTask = $state<Task | null>(null);
	todoTasks = $state<Task[]>([]);
	isLoading = $state(true);
	lastRefresh = $state(Date.now());

	async refresh() {
		try {
			const [current, todos] = await Promise.all([
				getCurrentTask(),
				getTasks({ status: 'todo', limit: 20 })
			]);

			this.currentTask = current;
			this.todoTasks = todos;
			this.lastRefresh = Date.now();
		} catch (error) {
			console.error('Failed to refresh tasks:', error);
		} finally {
			this.isLoading = false;
		}
	}

	async load() {
		this.isLoading = true;
		await this.refresh();
	}
}

export const tasksStore = new TasksStore();
