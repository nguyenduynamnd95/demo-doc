import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";

export type ToolBoxSearchProps = {
	open: boolean
	setOpen: (isOpen: boolean) => void
	docTextContent: string[]
	onResultClick: (page: number, term: string) => void
}

export default function ToolboxSearch({ open, setOpen, docTextContent, onResultClick }: ToolBoxSearchProps) {
	const t = useTranslations('docviewer')
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [searchResults, setSearchResults] = useState<{ index: number, text: string, position: number }[]>([]);
	const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay

	useEffect(() => {
		if (debouncedSearchTerm) {
			const results: { index: number, text: string, position: number }[] = [];

			docTextContent.forEach((text, index) => {
				const regex = new RegExp(`(${escapeRegExp(debouncedSearchTerm)})`, 'gi');
				let match;
				while ((match = regex.exec(text)) !== null) {
					const start = Math.max(match.index - 30, 0); // 30 characters before the match
					const end = Math.min(match.index + match[0].length + 30, text.length); // 30 characters after the match
					const surroundingText = text.slice(start, end);
					results.push({ index, text: surroundingText, position: match.index });
				}
			});

			setSearchResults(results);
		} else {
			setSearchResults([]);
		}
	}, [debouncedSearchTerm, docTextContent]);

	useEffect(() => {
		if (!open) {
			setSearchTerm('')
		}
	}, [open]);

	function escapeRegExp(str: string) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('search')}</DialogTitle>
					<DialogDescription>{t('searchDesc')}</DialogDescription>
				</DialogHeader>
				<Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
				{/* Display search results */}
				<div className="flex flex-col max-h-80 overflow-y-auto">
					{searchResults.map((result, idx) => (
						<div key={idx} className="py-2 border-b last:border-b-0 last:pb-0 cursor-pointer"
						     onClick={() => {
							     onResultClick(result.index + 1, searchTerm);
							     setSearchTerm('')
						     }}>
							{/* Highlighting the match in the text */}
							<span
								dangerouslySetInnerHTML={{
									__html: result.text.replace(
										new RegExp(`(${escapeRegExp(debouncedSearchTerm)})`, 'gi'),
										'<mark>$1</mark>'
									)
								}}
							/>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
