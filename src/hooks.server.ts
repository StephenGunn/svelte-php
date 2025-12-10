import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('session');
	const path = event.url.pathname;

	// Public routes that don't require auth
	const publicRoutes = ['/', '/api/auth/logout'];

	// Check if this is a public route
	const isPublicRoute = publicRoutes.some((route) => path === route);

	// If not authenticated and trying to access protected route, redirect to login
	if (!session && !isPublicRoute) {
		throw redirect(303, '/');
	}

	// If authenticated and trying to access login page, redirect to dashboard
	if (session && path === '/') {
		throw redirect(303, '/dashboard');
	}

	return resolve(event);
};
