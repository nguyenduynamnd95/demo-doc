import Sidebar from "@/app/(authorized)/(default)/Sidebar";


export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-dvh overflow-hidden">
			<Sidebar/>
			<main className="flex-1 overflow-auto p-5 ml-16 lg:ml-64 transition-all duration-300 ease-in-out">
				{children}
			</main>
		</div>
	)
}
