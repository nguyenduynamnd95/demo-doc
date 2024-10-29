'use client'

import { PDFDocumentProxy } from "pdfjs-dist";
import { useState } from "react";
import { Document, pdfjs, Thumbnail } from "react-pdf";
import { HistoryIcon, LoaderCircleIcon } from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { Doc, DocVersion } from "@/types/main";
import VersionsDialog from "@/app/(authorized)/(default)/documents/VersionsDialog";

export type DocumentDetailsProps = {
	metadata: Doc & {
		updatedAt?: Date
	}
	fileUrl: string
	readUrl: string
	versions: DocVersion[]
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const options = {
	cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
};

export default function DocumentCard({ metadata, fileUrl, readUrl, versions }: DocumentDetailsProps) {
	const fmt = useFormatter()
	const t = useTranslations('documents')
	const [numPages, setNumPages] = useState<number>();

	function onLoadSuccess(doc: PDFDocumentProxy) {
		setNumPages(doc.numPages)
	}

	return <Card className="flex flex-col md:flex-row max-w-4xl mx-auto overflow-hidden">
		<div className="w-full md:w-[200px] flex justify-center items-center bg-muted">
			<Document file={fileUrl} options={options} onLoadSuccess={onLoadSuccess}
			          loading={
				          <div className="w-[200px]"><LoaderCircleIcon className="m-auto w-10 h-10 animate-spin"/></div>
			          }>
				<Thumbnail width={200} pageNumber={1}/>
			</Document>
		</div>
		<div className="grow p-6 flex flex-col border-t md:border-l md:border-t-0">
			<h2 className="text-2xl font-semibold mb-4">{metadata.title}</h2>
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 text-sm">
				<div>
					<p className="text-muted-foreground">{t('pages')}</p>
					<p className="font-medium">{numPages}</p>
				</div>
				<div>
					<p className="text-muted-foreground">{t('author')}</p>
					<p className="font-medium">{metadata.createdBy.name}</p>
				</div>
				<div>
					<p className="text-muted-foreground">{t('updatedAt')}</p>
					<p className="font-medium">{metadata.updatedAt ? fmt.dateTime(metadata.updatedAt, 'default') : ''}</p>
				</div>
			</div>
			<div className="mb-6 text-sm">
				<p className="text-muted-foreground">{t('desc')}</p>
				<p className="font-medium">{metadata.description}</p>
			</div>
			<CardFooter className="p-0 pt-2 flex flex-wrap gap-2">
				<Link href={readUrl} className="flex-grow sm:flex-grow-0">
					<Button className="w-full sm:w-60" size="lg">{t('read')}</Button>
				</Link>
				<VersionsDialog data={versions}>
					<Button variant="outline" size="icon-lg">
						<HistoryIcon/>
					</Button>
				</VersionsDialog>
			</CardFooter>
		</div>
	</Card>
}
