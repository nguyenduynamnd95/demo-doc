'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFormatter, useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { DocVersion } from "@/types/main";

export type VersionsDialogProps = {
	data: DocVersion[]
	children: ReactNode
}

export default function VersionsDialog({ data, children }: VersionsDialogProps) {
	const t = useTranslations('documents')
	const fmt = useFormatter()
	const [isOpen, setOpen] = useState(false);
	const columns: ColumnDef<DocVersion>[] = [
		{
			accessorKey: "version",
			header: t('version'),
		},
		{
			accessorKey: "updatedAt",
			header: t('updatedAt'),
			cell: ({ row }) => fmt.dateTime(row.original.updatedAt, 'default'),
		},
		{
			id: 'actions',
			cell: ({ row }) => <span className="flex justify-end">
				<Link href={`/docviewer/${row.original.id}`}>
					<Button variant="ghost" size="icon">
						<EyeIcon/>
					</Button>
				</Link>
			</span>,
		},
	]


	return <Dialog open={isOpen} onOpenChange={setOpen}>
		<DialogTrigger asChild>
			{children}
		</DialogTrigger>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{t('versionsDialogTitle')}</DialogTitle>
			</DialogHeader>
			<DataTable columns={columns} data={data}/>
		</DialogContent>
	</Dialog>
}
