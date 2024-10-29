
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Thumbnail } from "react-pdf";
import { PDFDocumentProxy } from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import {
	Pin,
	PinIcon,
	PinOff,
	PinOffIcon
	// XIcon
} from "lucide-react";
import { useEffect, useState } from "react";

export type ToolboxOutlineProps = {
	open: boolean
	setOpen: (isOpen: boolean) => void
	isPinListPage: boolean; // Thêm prop này
  	setIsPinListPage: (isClicked: boolean) => void; // Thêm prop này
	doc?: PDFDocumentProxy
	onItemClick: (page: number) => void
	currentPageNum: number
	heightContent?: number,
	heightHeader?: number,
}

export default function DocumentListPage({ 
	open, 
	setOpen, 
	doc, 
	onItemClick, 
	currentPageNum, 
	isPinListPage,
	setIsPinListPage,
	heightContent,
	heightHeader

}: ToolboxOutlineProps) {

	return <Sheet open={open} onOpenChange={setOpen} modal={false}>
		<SheetContent
			side={"left"}
			style={{height: `${heightContent}px`, marginTop: `${heightHeader}px`}}
			className="w-64 max-h-dvh overflow-y-auto scroll-hidden [&>button:not(#docsListPinBtnId)]:hidden"
			onEscapeKeyDown={(e) => {
				if (isPinListPage) e.preventDefault();
			}}
			onPointerDown={(e) => {
				if (isPinListPage) e.preventDefault();
			}}
			onInteractOutside={(e) => {
				if (isPinListPage) e.preventDefault();
			}}
		>	
			<SheetHeader>
				<SheetTitle>
				</SheetTitle>
				<SheetDescription></SheetDescription>
			</SheetHeader>
			
			<div className="relative flex flex-col items-center">
				<Button id="docsListPinBtnId" variant="ghost" className="fixed left-0 hover:bg-transparent"
					onClick={() => setIsPinListPage(!isPinListPage)}>
					<Pin className={cn("h-5 w-5 ", isPinListPage ? 'text-[#006EE6]' : '')} />
				</Button>
				{doc?.numPages ? Array.from({ length: doc.numPages }, (_, i) => i + 1).map(page => (
					<div key={page} className="flex flex-col">
						<div className={cn("flex p-2 bg-transparent rounded-lg", page === currentPageNum ? 'bg-[#FFD9DB]' : '')}>
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
		</SheetContent>
	</Sheet>

}
