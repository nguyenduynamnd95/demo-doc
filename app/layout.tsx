import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "next-intl/server";
import ClientProviders from "@/app/ClientProviders";
import ServerProviders from "@/app/ServerProviders";
import { ReactNode } from "react";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
	weight: ['300', '400', '500', '600', '700'],
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: process.env.NEXT_PUBLIC_APP_NAME,
	description: "",
};

export default async function RootLayout({
	                                         children,
                                         }: Readonly<{
	children: ReactNode;
}>) {
	const locale = await getLocale()

	return (
		<html lang={locale}>
		<body className={notoSansJP.className}>
		<ServerProviders>
			<ClientProviders>
				{children}
			</ClientProviders>
		</ServerProviders>
		</body>
		</html>
	);
}
