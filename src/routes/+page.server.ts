import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get('session');
	if (session) {
		throw redirect(303, '/dashboard');
	}

	return {};
};

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');

		if (!password || typeof password !== 'string') {
			return fail(400, { error: 'Password is required' });
		}

		if (password !== env.PASSWORD) {
			return fail(401, { error: 'Invalid password' });
		}

		// Set secure session cookie - 1 year expiry
		cookies.set('session', crypto.randomUUID(), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true, // Always require HTTPS in production
			maxAge: 60 * 60 * 24 * 365 // 1 year
		});

		throw redirect(303, '/dashboard');
	}
} satisfies Actions;
