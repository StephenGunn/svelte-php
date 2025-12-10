import { query, command } from '$app/server';
import * as v from 'valibot';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { task } from '$lib/server/db/schema';

// Schemas
const CreateTaskSchema = v.object({
	title: v.string(),
	notes: v.optional(v.string())
});

const UpdateTaskSchema = v.object({
	taskId: v.string(),
	title: v.optional(v.string()),
	notes: v.optional(v.string())
});

const TaskIdSchema = v.object({
	taskId: v.string()
});

const GetTasksSchema = v.object({
	status: v.optional(v.picklist(['todo', 'in_progress', 'done'])),
	limit: v.optional(v.number(), 50)
});

// Query: Get tasks
export const getTasks = query(
	GetTasksSchema,
	async ({ status, limit }: v.InferOutput<typeof GetTasksSchema>) => {
		const conditions = [];
		if (status) {
			conditions.push(eq(task.status, status));
		}

		const tasks = await db
			.select()
			.from(task)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(task.createdAt))
			.limit(limit);

		return tasks;
	}
);

// Query: Get current task (in_progress)
export const getCurrentTask = query(async () => {
	const currentTask = await db
		.select()
		.from(task)
		.where(eq(task.status, 'in_progress'))
		.orderBy(desc(task.startedAt))
		.limit(1);

	return currentTask[0] || null;
});

// Command: Create task
export const createTask = command(
	CreateTaskSchema,
	async ({ title, notes }: v.InferOutput<typeof CreateTaskSchema>) => {
		const newTask = await db
			.insert(task)
			.values({
				title,
				notes,
				status: 'todo',
				createdAt: new Date()
			})
			.returning();

		return newTask[0];
	}
);

// Command: Start task (sets status to in_progress and records start time)
export const startTask = command(
	TaskIdSchema,
	async ({ taskId }: v.InferOutput<typeof TaskIdSchema>) => {
		// First, pause any other in-progress tasks
		await db
			.update(task)
			.set({ status: 'todo' })
			.where(eq(task.status, 'in_progress'));

		// Start the selected task
		const updated = await db
			.update(task)
			.set({
				status: 'in_progress',
				startedAt: new Date()
			})
			.where(eq(task.id, taskId))
			.returning();

		return updated[0];
	}
);

// Command: Pause task (sets back to todo without completing)
export const pauseTask = command(
	TaskIdSchema,
	async ({ taskId }: v.InferOutput<typeof TaskIdSchema>) => {
		const updated = await db
			.update(task)
			.set({ status: 'todo' })
			.where(eq(task.id, taskId))
			.returning();

		return updated[0];
	}
);

// Command: Complete task
export const completeTask = command(
	TaskIdSchema,
	async ({ taskId }: v.InferOutput<typeof TaskIdSchema>) => {
		const updated = await db
			.update(task)
			.set({
				status: 'done',
				completedAt: new Date()
			})
			.where(eq(task.id, taskId))
			.returning();

		return updated[0];
	}
);

// Command: Update task
export const updateTask = command(
	UpdateTaskSchema,
	async ({ taskId, title, notes }: v.InferOutput<typeof UpdateTaskSchema>) => {
		const updates: any = {};
		if (title !== undefined) updates.title = title;
		if (notes !== undefined) updates.notes = notes;

		const updated = await db.update(task).set(updates).where(eq(task.id, taskId)).returning();

		return updated[0];
	}
);

// Command: Delete task
export const deleteTask = command(
	TaskIdSchema,
	async ({ taskId }: v.InferOutput<typeof TaskIdSchema>) => {
		await db.delete(task).where(eq(task.id, taskId));
	}
);
