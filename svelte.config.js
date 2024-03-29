//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),

		prerender: {
			crawl: true,
			enabled: true,
			handleHttpError: 'fail',
			entries: ['*']
		},
	}
};

export default config;
