<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<div class="min-h-screen p-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">dashboard</h1>
		<a href="/api/auth/logout">
			<Button variant="outline">logout</Button>
		</a>
	</div>

	<div class="grid gap-6">
		<div class="rounded-lg border border-border bg-card p-6">
			<h2 class="mb-4 text-xl font-semibold">welcome</h2>
			<p class="text-muted-foreground">your personal new tab page is ready</p>
		</div>
	</div>
</div>
