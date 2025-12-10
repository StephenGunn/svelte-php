<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldError
	} from '$lib/components/ui/field';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="flex w-full max-w-md flex-col gap-6 p-4">
		<form method="POST">
			<FieldGroup>
				<div class="flex flex-col gap-2 text-center">
					<h1 class="text-2xl font-bold">dashboard</h1>
					<FieldDescription>personal new tab page</FieldDescription>
				</div>
				<Field>
					<FieldLabel for="password">password</FieldLabel>
					<Input id="password" name="password" type="password" required />
					{#if form?.error}
						<FieldError>{form.error}</FieldError>
					{/if}
				</Field>
				<Field>
					<Button type="submit" class="w-full">login</Button>
				</Field>
			</FieldGroup>
		</form>
	</div>
</div>
