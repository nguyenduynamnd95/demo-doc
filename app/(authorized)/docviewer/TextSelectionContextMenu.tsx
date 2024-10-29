'use client'

import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Brush, StickyNote } from 'lucide-react'
import { Button } from "@/components/ui/button";

export type TextSelectionState = {
	text: string
	scope: DOMRect[]
}

interface TextSelectionMenuProps {
	children: ReactNode;
	onHighlight?: (state: TextSelectionState) => void;
	onNote?: (state: TextSelectionState) => void;
}

export default function TextSelectionContextMenu({ children, onHighlight, onNote }: TextSelectionMenuProps) {
	const [menuVisible, setMenuVisible] = useState(false)
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
	const [selectionState, setSelectionState] = useState<TextSelectionState>()
	const containerRef = useRef<HTMLDivElement>(null)
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleContextMenu = (e: MouseEvent | TouchEvent) => {
			e.preventDefault()
		}

		const handleSelectionChange = () => {
			showMenu()
		}

		const showMenu = () => {
			const selection = window.getSelection()
			if (selection && selection.toString().length > 0 && containerRef.current?.contains(selection.anchorNode)) {
				const range = selection.getRangeAt(0)
				const rect = range.getBoundingClientRect()
				setSelectionState({
					text: selection.toString(),
					scope: Array.from(range.getClientRects()),
				})
				setMenuPosition({
					x: (rect.left + rect.right) / 2,
					y: rect.bottom + window.scrollY,
				})
				setMenuVisible(true)
			} else {
				setMenuVisible(false)
			}
		}

		document.addEventListener('selectionchange', handleSelectionChange)
		document.addEventListener('contextmenu', handleContextMenu)
		return () => {
			document.removeEventListener('selectionchange', handleSelectionChange)
			document.removeEventListener('contextmenu', handleContextMenu)
		}
	}, [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuVisible(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('touchstart', handleClickOutside)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('touchstart', handleClickOutside)
		}
	}, [])

	const handleMenuItemClick = (action: 'highlight' | 'note') => {
		switch (action) {
			case 'highlight':
				selectionState && onHighlight && onHighlight(selectionState)
				break
			case 'note':
				selectionState && onNote && onNote(selectionState)
				break
		}
		setMenuVisible(false)
	}

	return (
		<div ref={containerRef}>
			{children}
			{menuVisible && (
				<div
					ref={menuRef}
					className="fixed flex z-10 bg-white rounded-lg p-1"
					style={{
						left: `${menuPosition.x}px`,
						top: `${menuPosition.y}px`,
						transform: 'translate(-50%, 20px)',
						boxShadow: '0 0px 50px 0px rgb(0 0 0 / 0.25)',
					}}
				>
					<Button
						variant="ghost" size="icon"
						onClick={() => handleMenuItemClick('highlight')}
					>
						<Brush className="h-5 w-5"/>
					</Button>
					<Button
						variant="ghost" size="icon"
						onClick={() => handleMenuItemClick('note')}
					>
						<StickyNote className="h-5 w-5"/>
					</Button>
				</div>
			)}
		</div>
	)
}
