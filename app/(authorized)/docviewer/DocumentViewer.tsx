'use client'

import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useMemo, useRef, useState } from "react";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { cn } from "@/lib/utils";
import { useGesture } from '@use-gesture/react';
import { useSpring } from 'react-spring';
import { animated } from '@react-spring/web';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	LoaderCircleIcon,
	MinusIcon,
	PlusIcon,
	SearchIcon,
	ArrowLeft,
	PenLine,
	Columns,
	ChevronsLeftIcon,
	ChevronsRightIcon
	// XIcon
} from "lucide-react";
import Link from "next/link";
import TextSelectionContextMenu, { TextSelectionState } from "@/app/(authorized)/docviewer/TextSelectionContextMenu";
import { useTranslations } from "next-intl";
import ToolboxSearch from "@/app/(authorized)/docviewer/ToolboxSearch";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { PDFDocumentProxy } from "pdfjs-dist";
import ToolboxNotes from "@/app/(authorized)/docviewer/ToolboxNotes";
import { DocNote, TextScopeRect } from "@/types/main";
import { useAddNote, useDeleteNote, useGetNotes, useUpdateNote } from "@/services/client/document";
import ToolboxOutline from "@/app/(authorized)/docviewer/ToolboxOutline";
import DocumentListPage from "./DocumentListPage";
import { Progress } from "@/components/ui/progress";
import SheetSearch from "./SheetSearch";

export type DocumentViewerProps = {
	className?: string
	fileUrl: string
	docVerId: number
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const options = {
	cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
};

export default function DocumentViewer({ className, fileUrl, docVerId }: DocumentViewerProps) {
	const t = useTranslations('docviewer')
	const [doc, setDoc] = useState<PDFDocumentProxy>()
	const [numPages, setNumPages] = useState<number>();
	const [pageNumber, setPageNumber] = useState<number>(1);
	// const [notes, setNotes] = useState<DocNote[]>([]);
	const [noteAddOpen, setNoteAddOpen] = useState(false);
	const [noteEditOpen, setNoteEditOpen] = useState(false);
	const [note, setNote] = useState<DocNote>();
	const [scale, setScale] = useState<number>(1);
	const [openToolboxSearch, setOpenToolboxSearch] = useState<boolean>(false)
	const pdfPageRef = useRef<HTMLDivElement>(null);
	const [docTextItems, setDocTextItems] = useState<TextItem[][]>([])
	const docTextItemsContent = useMemo(() => docTextItems.map(items => items.map(item => item.str).join('')), [docTextItems])
	const [openSheet, setOpenSheet] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>('')
	const searchTermHighlightRects = useMemo<TextScopeRect[]>(() => {
		// !important: must not add scale as dependency
		const pdfPageRect = pdfPageRef.current?.getBoundingClientRect()
		if (!pdfPageRect || searchTerm.length === 0) return [];
		return (docTextItems.at(pageNumber - 1) ?? [])
			.filter(item => checkTextOverlap(item.str, searchTerm) !== 'none')
			.map(item => ({
				top: (pdfPageRect.height - (item.transform[5] + item.height - 3) * scale) / pdfPageRect.height * 100,
				left: item.transform[4] * scale / pdfPageRect.width * 100,
				width: item.width * scale / pdfPageRect.width * 100,
				height: item.height * scale / pdfPageRect.height * 100,
			}))
	}, [docTextItems, pageNumber, searchTerm])
	const [openToolboxNotes, setOpenToolboxNotes] = useState<boolean>(false)
	const [openOutline, setOpenOutline] = useState<boolean>(false)
	const notesQuery = useGetNotes(docVerId)
	const notes = useMemo(() => notesQuery.data?.data ?? [], [notesQuery.data])
	const addNoteMutation = useAddNote(docVerId)
	const updateNoteMutation = useUpdateNote(docVerId)
	const deleteNoteMutation = useDeleteNote(docVerId)

	const [isPinListPage, setIsPinListPage] = useState<boolean>(false);
	const [openDocList, setOpenDoclist] = useState<boolean>(false);
	const divRefContent = useRef(null);
	const [divHeightContent, setDivHeightContent] = useState(0);
	const divRefHeader = useRef(null);
	const [divHeightHeader, setDivHeightHeader] = useState(0);
	const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

	function checkTextOverlap(text1: string, text2: string): 'parent-child' | 'child-parent' | 'none' | 'end-start' | 'start-end' {
		if (text1.includes(text2))
			return 'parent-child'
		if (text2.includes(text1))
			return 'child-parent'
		let size = Math.min(text1.length, text2.length)
		while (size > 0) {
			const chunk1 = text1.slice(text1.length - size, text1.length)
			const chunk2 = text2.slice(0, size)
			if (chunk1 === chunk2) {
				return 'end-start'
			}
			const chunk3 = text1.slice(0, size)
			const chunk4 = text2.slice(text2.length - size, text2.length)
			if (chunk3 === chunk4) {
				return 'start-end'
			}
			size--
		}
		return 'none'
	}

	function onDocumentLoadSuccess(docData: PDFDocumentProxy) {
		setDoc(docData)
		setNumPages(docData.numPages);
		const pagePromises = Array.from(
			{ length: docData.numPages },
			async (_, pageNumber) => {
				const pageData = await docData.getPage(pageNumber + 1);
				const textContent = await pageData.getTextContent();
				return textContent.items.map((item) => (item as TextItem));
			}
		);
		Promise.all(pagePromises).then(textItems => {
			setDocTextItems(textItems)
		});
	}

	function normalizeSelectionScope(scope: DOMRect[]): TextScopeRect[] | null {
		const pdfPageRect = pdfPageRef.current?.getBoundingClientRect()
		return pdfPageRect
			? scope.map(rect => ({
				top: (rect.top - pdfPageRect.top) / pdfPageRect.height * 100,
				left: (rect.left - pdfPageRect.left) / pdfPageRect.width * 100,
				width: rect.width / pdfPageRect.width * 100,
				height: rect.height / pdfPageRect.height * 100,
			}))
			: null
	}

	function onHighlightAdd(selection: TextSelectionState) {
		const scope = normalizeSelectionScope(selection.scope)
		if (selection && scope) {
			addNoteMutation.mutate({
				page: pageNumber,
				highlight: selection.text,
				scope,
				content: '',
			})
			// setNotes(prev => [...prev, {
			// 	id: Date.now(),
			// 	page: pageNumber,
			// 	highlight: selection.text,
			// 	scope,
			// }])
		}
	}

	function onNoteAddOpen(selection: TextSelectionState) {
		const scope = normalizeSelectionScope(selection.scope)
		if (selection && scope) {
			setNote({
				id: Date.now(),
				page: pageNumber,
				highlight: selection.text,
				scope,
				content: '',
			})
			setNoteAddOpen(true);
		}
	}

	function onNoteAddSubmit() {
		if (note) {
			addNoteMutation.mutate({
				...note,
			})
			// setNotes(prev => [...prev, { ...note }])
			setNote(undefined)
		}
		setNoteAddOpen(false)
	}

	function onNoteEditOpen(noteId: number) {
		const selectedNote = notes.find((note) => note.id === noteId)
		if (selectedNote) {
			setNote(notes.find(note => note.id === noteId))
			setNoteEditOpen(true)
		}
	}

	function onNoteEditSubmit() {
		if (note) {
			updateNoteMutation.mutate({
				...note,
			})
			// setNotes(prev => [
			// 	...prev.filter(item => item.id !== note.id),
			// 	{ ...note }
			// ])
			setNote(undefined)
		}
		setNoteEditOpen(false)
	}

	function onNoteDelete() {
		if (note) {
			deleteNoteMutation.mutate(note.id)
			// setNotes(prev => prev.filter(item => item.id !== note.id))
			setNote(undefined)
		}
		setNoteEditOpen(false)
	}

	const [{ x }, api] = useSpring(() => ({ x: 0 }));

	
	const [offset, setOffset] = useState([0, 0]); // Trạng thái cho vị trí kéo
	const [isDragging, setIsDragging] = useState(false);
	const bind = useGesture(
		{
			// onDrag: ({ movement: [mx, my], memo = offset }) => {
			// 	if (scale > 1) {
			// 		// Khi đang ở chế độ zoom, cho phép kéo nội dung
			// 		setIsDragging(true); // Đặt trạng thái kéo
			// 		const newOffset = [memo[0] + mx, memo[1] + my];
			// 		setOffset(newOffset); // Cập nhật vị trí kéo
			// 		return newOffset; // Trả về vị trí mới
			// 	  }
			// 	return memo; // Trả về vị trí không thay đổi nếu không ở chế độ zoom
			//   },
			onDragEnd: ({ movement: [mx, my], direction: [xDir], event }) => {
				// if (isDragging) {
				// 	setIsDragging(false); // Kết thúc trạng thái kéo
				// 	// Có thể thêm logic nào đó nếu cần
				//   }

				if ('pointerType' in event && event.pointerType === 'touch') {
					event.preventDefault();
					if (scale > 1) {
						console.log('đang zoom');
						
						// Không chuyển trang khi zoom
						return;
					  }
					const dist = Math.sqrt(mx ** 2 + my ** 2);
					if (dist > 20 && Math.abs(mx) > Math.abs(my)) {
						if (xDir < 0) {
							setPageNumber((prev) => (numPages && prev < numPages ? prev + 1 : prev));
						} else {
							setPageNumber((prev) => (prev > 1 ? prev - 1 : prev));
						}
					}
					api.start({ x: 0 });
				}

			},

			onPinch: ({ offset: [d], memo }) => {
				// return scale;
				if (!memo) memo = scale;
				const zoomFactor = d > 1 ? 0.1 : -0.1; // Tăng hoặc giảm theo d
				const newScale = Math.max(0.1, Math.min(memo + zoomFactor, 5)); // Giới hạn scale từ 0.1 đến 5
				
				setScale(newScale);
				return memo;
			},
			
		},
		{
			drag: { from: () => [x.get(), 0], filterTaps: true },
			pinch: { scaleBounds: { min: 0.1, max: 5 }, preventDefault: true },
		}
	);

	useEffect(() => {

		if (divRefContent.current) {
			setDivHeightContent(divRefContent.current?.offsetHeight);
		}
		if (divRefHeader.current) {
			setDivHeightHeader(divRefHeader.current?.offsetHeight);
		}
	}, [divRefContent?.current?.offsetHeight, divRefHeader.current?.offsetHeight]);

	const checkTouchDevice = () => {
		const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		setIsTouchDevice(isTouch);
	};

	useEffect(() => {
		checkTouchDevice();

		// Lắng nghe sự kiện 'resize' và 'touchstart' để cập nhật khi chuyển đổi giữa di động và desktop
		window.addEventListener('resize', checkTouchDevice);
		window.addEventListener('touchstart', checkTouchDevice);

		return () => {
			window.removeEventListener('resize', checkTouchDevice);
			window.removeEventListener('touchstart', checkTouchDevice);
		};
	}, []);


	return <div className={cn("h-dvh flex flex-col", className)}>
		<div id="headerDocViewId" className="flex p-3" ref={divRefHeader}>
			<div className="flex-1 ml-2.5">
				<Link href="/">
					<Button variant="ghost" size="icon" className="border border-[#C8C8C857]">
						<ArrowLeft className="h-5 w-5" />
					</Button>
				</Link>
				<Button
					variant="ghost"
					size="icon"
					className={cn("border border-[#C8C8C857] ml-2.5", openDocList ? 'bg-[#F9F9F9]' : '')}
					// onClick={() => setOpenDoclist(openDocList)}

					onClick={() => {
						setOpenDoclist(!openDocList);
						setIsPinListPage(false);

					}}
				>
					<Columns className="h-5 w-5" />
				</Button>

			</div>

			<div className="flex flex-1 gap-1 items-center justify-center">
				<Button variant="ghost" size="icon" onClick={() => setScale(prev => prev > 0.1 ? prev - 0.1 : prev)}>
					<MinusIcon className="h-5 w-5" />
				</Button>
				<div className="border px-2 py-1 rounded w-20 text-center">{Math.round(scale * 100)}%</div>
				<Button variant="ghost" size="icon" onClick={() => setScale(prev => prev + 0.1)}>
					<PlusIcon className="h-5 w-5" />
				</Button>
			</div>
			<div className="flex flex-1 justify-end mr-2.5">
				<Button
					variant="ghost"
					size="icon"
					className={cn("border border-[#C8C8C857] mr-2.5", openToolboxSearch ? 'bg-[#F9F9F9]' : '')}
					onClick={() => setOpenToolboxSearch(true)}>
					<SearchIcon className="h-5 w-5" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className={cn("border border-[#C8C8C857]", openToolboxNotes ? 'bg-[#F9F9F9]' : '')}
					onClick={() => setOpenToolboxNotes(true)}>
					<PenLine className="h-5 w-5" />
				</Button>

			</div>
		</div>
		<animated.div
			{...(isTouchDevice ? bind() : {})}
			style={{
				x,
				touchAction: 'none'
			}}
			className="grow overflow-auto scroll-hidden flex items-center justify-center flex-col  bg-[#F9F9F9]"
			ref={divRefContent}
		>
			<Document className={cn('w-fit', {
				'mx-auto': !openDocList,
				'lg:ml-auto lg:pr-[90px] sm:ml-auto md:ml-auto xl:mx-auto xl:pr-0': openDocList,
			})}
				file={fileUrl} options={options} onLoadSuccess={onDocumentLoadSuccess}
				loading={DocumentLoading}>
				<TextSelectionContextMenu onHighlight={onHighlightAdd} onNote={onNoteAddOpen}>
					<Page inputRef={pdfPageRef} scale={scale} pageNumber={pageNumber}>
						<div>
							{notes.filter(note => note.page === pageNumber).map(note =>
								note.scope.map((rect, rectIdx) => (
									<div key={`${note.id}_${rectIdx}`}
										className="absolute cursor-pointer z-10 bg-emerald-400 bg-opacity-40"
										style={{
											top: rect.top + '%',
											left: rect.left + '%',
											width: rect.width + '%',
											height: rect.height + '%',
										}}
										onClick={() => onNoteEditOpen(note.id)}
									></div>
								))
							)}
						</div>
						<div>
							{searchTermHighlightRects.map((rect, idx) => (
								<div key={idx} className="absolute cursor-pointer z-20 bg-yellow-300 bg-opacity-40"
									style={{
										top: `${rect.top}%`,
										left: `${rect.left}%`,
										width: `${rect.width}%`,
										height: `${rect.height}%`,
									}}
									onClick={() => setSearchTerm('')}
								></div>
							))}
						</div>
					</Page>
				</TextSelectionContextMenu>
				<div id="toolboxCpnId" className="fixed bottom-[10px] left-1/2 transform -translate-x-1/2 z-10 lg:mt-[10px] sm:mt-[10px] md:mt-[10px] 
					flex flex-1 py-[6px] px-[20px] gap-1 items-center justify-center bg-[#00000080] rounded-3xl">
					<Button variant="ghost" size="icon" onClick={() => setPageNumber(prev => prev > 1 ? prev - 1 : prev)}
						className="hover:bg-[#FFFFFF33] h-9 w-9">
						<ChevronsLeftIcon className="h-5 w-5 text-[#FFFFFF]" />
					</Button>
					<div className="text-[#FFFFFF]"><span className="bg-[#FFFFFF33]  py-[6px] px-[13px] rounded  text-center">{pageNumber}</span>/{numPages}</div>
					<Button variant="ghost" size="icon" className="hover:bg-[#FFFFFF33] h-9 w-9"
						onClick={() => setPageNumber(prev => numPages && prev < numPages ? prev + 1 : prev)}>
						<ChevronsRightIcon className="h-5 w-5 text-[#FFFFFF]" />
					</Button>
					<div className="text-[#D9D9D9] pb-[5px]">|</div>
					<Button variant="ghost" size="icon" className="hover:bg-[#FFFFFF33] h-9 w-9"
						onClick={() => setScale(prev => prev > 0.1 ? prev - 0.1 : prev)}>
						<MinusIcon className="h-5 w-5 text-[#FFFFFF]" />
					</Button>
					<div className="bg-[#FFFFFF33]  py-[6px] px-[13px] rounded  text-center text-[#FFFFFF]">{Math.round(scale * 100)}%</div>
					<Button variant="ghost" size="icon" className="hover:bg-[#FFFFFF33] h-9 w-9"
						onClick={() => setScale(prev => prev + 0.1)}>
						<PlusIcon className="h-5 w-5 text-[#FFFFFF]" />
					</Button>
				</div>
			</Document>



		</animated.div>
		<DocumentListPage open={openDocList} setOpen={setOpenDoclist} doc={doc} currentPageNum={pageNumber}
			onItemClick={pageNum => {
				setPageNumber(pageNum)
				setOpenOutline(false)
			}}
			isPinListPage={isPinListPage}
			setIsPinListPage={setIsPinListPage}
			heightContent={divHeightContent}
			heightHeader={divHeightHeader}
		/>

		{/* <div className="relative grow overflow-auto scroll-hidden flex items-center justify-center flex-col  bg-[#F9F9F9]"
			ref={divRefContent}>
			<Document className={cn('w-fit', {
				'mx-auto': !openDocList,
				'lg:ml-auto lg:pr-[90px] sm:ml-auto md:ml-auto xl:mx-auto xl:pr-0': openDocList,
			})}
				file={fileUrl} options={options} onLoadSuccess={onDocumentLoadSuccess}
				loading={DocumentLoading}>
				<TextSelectionContextMenu onHighlight={onHighlightAdd} onNote={onNoteAddOpen}>
					<Page inputRef={pdfPageRef} scale={scale} pageNumber={pageNumber}>
						<div>
							{notes.filter(note => note.page === pageNumber).map(note =>
								note.scope.map((rect, rectIdx) => (
									<div key={`${note.id}_${rectIdx}`}
										className="absolute cursor-pointer z-10 bg-emerald-400 bg-opacity-40"
										style={{
											top: rect.top + '%',
											left: rect.left + '%',
											width: rect.width + '%',
											height: rect.height + '%',
										}}
										onClick={() => onNoteEditOpen(note.id)}
									></div>
								))
							)}
						</div>
						<div>
							{searchTermHighlightRects.map((rect, idx) => (
								<div key={idx} className="absolute cursor-pointer z-20 bg-yellow-300 bg-opacity-40"
									style={{
										top: `${rect.top}%`,
										left: `${rect.left}%`,
										width: `${rect.width}%`,
										height: `${rect.height}%`,
									}}
									onClick={() => setSearchTerm('')}
								></div>
							))}
						</div>
					</Page>
				</TextSelectionContextMenu>
				<div className="fixed bottom-[10px] left-1/2 transform -translate-x-1/2 z-10 lg:mt-[10px] sm:mt-[10px] md:mt-[10px] 
					flex flex-1 py-[6px] px-[20px] gap-1 items-center justify-center bg-[#00000080] rounded-3xl">
					<Button variant="ghost" size="icon" onClick={() => setPageNumber(prev => prev > 1 ? prev - 1 : prev)}
						className="hover:bg-[#FFFFFF33] h-9 w-9">
						<ChevronsLeftIcon className="h-5 w-5 text-[#FFFFFF]" />
					</Button>
					<div className="text-[#FFFFFF]"><span className="bg-[#FFFFFF33]  py-[6px] px-[13px] rounded  text-center">{pageNumber}</span>/{numPages}</div>
					<Button variant="ghost" size="icon" className="hover:bg-[#FFFFFF33] h-9 w-9"
						onClick={() => setPageNumber(prev => numPages && prev < numPages ? prev + 1 : prev)}>
						<ChevronsRightIcon className="h-5 w-5 text-[#FFFFFF]" />
					</Button>
					<div className="text-[#D9D9D9] pb-[5px]">|</div>
					<Button variant="ghost" size="icon" className="hover:bg-[#FFFFFF33] h-9 w-9"
						onClick={() => setScale(prev => prev > 0.1 ? prev - 0.1 : prev)}>
						<MinusIcon className="h-5 w-5 text-[#FFFFFF]" />
					</Button>
					<div className="bg-[#FFFFFF33]  py-[6px] px-[13px] rounded  text-center text-[#FFFFFF]">{Math.round(scale * 100)}%</div>
					<Button variant="ghost" size="icon" className="hover:bg-[#FFFFFF33] h-9 w-9"
						onClick={() => setScale(prev => prev + 0.1)}>
						<PlusIcon className="h-5 w-5 text-[#FFFFFF]" />
					</Button>
				</div>
			</Document>
		

			<DocumentListPage open={openDocList} setOpen={setOpenDoclist} doc={doc} currentPageNum={pageNumber}
				onItemClick={pageNum => {
					setPageNumber(pageNum)
					setOpenOutline(false)
				}}
				isPinListPage={isPinListPage}
				setIsPinListPage={setIsPinListPage}
				heightContent={divHeightContent}
				heightHeader={divHeightHeader}
			/>

		</div> */}

		<Dialog open={noteAddOpen} onOpenChange={setNoteAddOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('noteAdd')}</DialogTitle>
					<DialogDescription className="text-left">
						{note?.highlight}
					</DialogDescription>
				</DialogHeader>
				<Textarea value={note?.content}
					onChange={e => setNote(prev => prev && ({ ...prev, content: e.target.value }))}
					rows={5} style={{ resize: 'none' }} />
				<DialogFooter className="flex">
					<Button className="flex-1" onClick={onNoteAddSubmit}>{t('save')}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		<Dialog open={noteEditOpen} onOpenChange={setNoteEditOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle></DialogTitle>
					<DialogDescription className="text-left">
						{note?.highlight}
					</DialogDescription>
				</DialogHeader>
				<Textarea value={note?.content}
					onChange={e => setNote(prev => prev && ({ ...prev, content: e.target.value }))}
					rows={5} style={{ resize: 'none' }} />
				<div className="flex gap-2">
					<Button className="flex-1" size="lg" variant="destructive" onClick={onNoteDelete}>{t('delete')}</Button>
					<Button className="flex-1" size="lg" onClick={onNoteEditSubmit}>{t('save')}</Button>
				</div>
			</DialogContent>
		</Dialog>
		<ToolboxOutline open={openOutline} setOpen={setOpenOutline} doc={doc} currentPageNum={pageNumber}
			onItemClick={pageNum => {
				setPageNumber(pageNum)
				setOpenOutline(false)
			}} />
		{/* <ToolboxSearch open={openToolboxSearch} setOpen={setOpenToolboxSearch} docTextContent={docTextItemsContent}
			onResultClick={(page, term) => {
				setOpenToolboxSearch(false)
				setOpenSheet(false)
				setPageNumber(page)
				setSearchTerm(term)
			}} /> */}
		<ToolboxNotes open={openToolboxNotes} setOpen={setOpenToolboxNotes} notes={notes}
			onNoteClick={item => {
				setOpenToolboxNotes(false)
				setOpenSheet(false)
				setPageNumber(item.page)
			}} />

		<SheetSearch open={openToolboxSearch} setOpen={setOpenToolboxSearch} docTextContent={docTextItemsContent}
			onResultClick={(page, term) => {
				setOpenToolboxSearch(false)
				setOpenSheet(false)
				setPageNumber(page)
				setSearchTerm(term)
			}}
			heightContent={divHeightContent}
			heightHeader={divHeightHeader}
		/>

	</div>
}

const DocumentLoading = () => {
	return <LoaderCircleIcon className="fixed inset-0 m-auto w-10 h-10 animate-spin" />
}
