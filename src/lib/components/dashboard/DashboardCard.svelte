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

<div class={cn('rounded-lg border border-border bg-card p-6', className)}>
	{#if title}
		<h2 class="mb-4 text-lg font-semibold">{title}</h2>
	{/if}
	{@render children()}
</div>
