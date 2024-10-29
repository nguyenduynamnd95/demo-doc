'use server'

import { ReactNode } from "react";
import { Formats, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function ServerProviders({ children }: { children: ReactNode }) {
	const messages = await getMessages();
	const formats: Partial<Formats> = {
		dateTime: {
			default: {
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				hour12: false,
				timeZone: 'Asia/Tokyo',
				timeZoneName: 'short',
			},
			defaultDateOnly: {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			}
		},
	}
	return <NextIntlClientProvider messages={messages} formats={formats}>
		{children}
	</NextIntlClientProvider>
}
