import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Thumbnail } from "react-pdf";
import { PDFDocumentProxy } from "pdfjs-dist";

export type ToolboxOutlineProps = {
	open: boolean
	setOpen: (isOpen: boolean) => void
	doc?: PDFDocumentProxy
	onItemClick: (page: number) => void
	currentPageNum: number
}

export default function ToolboxOutline({ open, setOpen, doc, onItemClick, currentPageNum }: ToolboxOutlineProps) {
	return <Dialog open={open} onOpenChange={setOpen}>
		<DialogContent className="max-h-dvh overflow-y-auto">
			<DialogHeader>
				<DialogTitle></DialogTitle>
				<DialogDescription>
				</DialogDescription>
			</DialogHeader>
			<div className="flex flex-col items-center">
				{doc?.numPages ? Array.from({ length: doc.numPages }, (_, i) => i + 1).map(page => (
					<div key={page} className="flex flex-col">
						<div className={cn("flex p-2 bg-transparent", page === currentPageNum ? 'bg-muted-foreground' : '')}>
							<Thumbnail
								className="shadow-xl"
								pdf={doc} width={150}
								key={page} pageNumber={page}
								onItemClick={({ pageNumber: pageNum }) => onItemClick(pageNum)}/>
						</div>
						<p className="text-center py-2">{page}</p>
					</div>
				)) : ''}
			</div>
		</DialogContent>
	</Dialog>
}
