// src/lib/react-query.js
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: false,
		},
	},
});

export default queryClient;
