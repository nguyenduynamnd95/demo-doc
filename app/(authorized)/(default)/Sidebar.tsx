import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart2, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { isAdmin, signout } from "@/services/server/kintone";

type MenuItem = {
	label: string
	icon: React.FunctionComponent<{ className?: string }>
	path: string
}

export default async function Sidebar({ className }: { className?: string }) {
	const t = await getTranslations('sidebar')
	const baseMenu = [
		{ label: t('documents'), icon: FileText, path: '/documents' },
	]
	const menu: MenuItem[] = await isAdmin() ? [
		...baseMenu,
		{ label: t('reports'), icon: BarChart2, path: '/reports' },
	] : baseMenu

	async function logout() {
		'use server'
		signout()
		redirect('/login')
	}

	return <aside
		className={cn("bg-background fixed top-0 left-0 z-40 h-dvh transition-all duration-300 ease-in-out w-16 lg:w-64 border-r", className)}
		aria-label="Sidebar"
	>
		<div className="flex flex-col h-full">
			<div className="p-4 flex items-center justify-center lg:justify-start">
				<Image src="/images/logo.png" alt="logo" width={32} height={32} className="rounded-full lg:mr-2"/>
				<h2 className="text-lg font-semibold hidden lg:inline">{process.env.NEXT_PUBLIC_APP_NAME}</h2>
			</div>
			<Separator/>
			<nav className="flex-1 p-3">
				<ul className="space-y-2">
					{menu.map((item: MenuItem) => (
						<li key={item.path}>
							<Link href={item.path}>
								<Button
									variant="ghost"
									className="w-full justify-center lg:justify-start px-2"
								>
									<item.icon className="h-5 w-5 lg:mr-2"/>
									<span className="hidden lg:inline">{item.label}</span>
								</Button>
							</Link>
						</li>
					))}
				</ul>
			</nav>
			<Separator/>
			<form className="p-3" action={logout}>
				<Button type="submit"
				        variant="ghost"
				        className="w-full justify-center lg:justify-start text-destructive hover:text-destructive hover:bg-red-100 px-2"
				>
					<LogOut className="h-5 w-5 lg:mr-2"/>
					<span className="hidden lg:inline">{t('logout')}</span>
				</Button>
			</form>
		</div>
	</aside>
}
