<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		title,
		children,
		class: className
	}: {
		title?: string;
		children: any;
		class?: string;
	} = $props();
</script>

<div class={cn('rounded-lg border border-border bg-card p-4', className)}>
	{#if title}
		<h2 class="mb-3 text-sm font-medium text-muted-foreground">{title}</h2>
	{/if}
	{@render children()}
</div>
