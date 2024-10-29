'use client'

import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/lib/queryClient";

export default function ClientProviders({ children }: { children: ReactNode }) {
	return <QueryClientProvider client={queryClient}>
		{children}
	</QueryClientProvider>
}