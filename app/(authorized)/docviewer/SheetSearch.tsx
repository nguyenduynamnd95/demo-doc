
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
    SearchIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";

export type ToolBoxSearchProps = {
    open: boolean
    setOpen: (isOpen: boolean) => void
    docTextContent: string[]
    onResultClick: (page: number, term: string) => void;
    heightContent?: number
    heightHeader?: number
}

export default function SheetSearch({ open, setOpen, docTextContent, onResultClick, heightContent, heightHeader }: ToolBoxSearchProps) {
    // const t = useTranslations('docviewer')
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
            console.log('results: ', results);

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
    return <Sheet open={open} onOpenChange={setOpen} modal={false}>
        <SheetContent
            style={{ height: `${heightContent}px`, marginTop: `${heightHeader}px` }}
            className="w-64 max-h-dvh overflow-y-auto scroll-hidden [&>button:not(#sheetSearchBtnId)]:hidden"
        >
            <SheetHeader>
                <SheetTitle>
                </SheetTitle>
                <SheetDescription></SheetDescription>
            </SheetHeader>

            <div className="relative">
                <div className="fixed w-[210px]">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pr-12 pl-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {/* Display search results */}
                <div
                    style={{ maxHeight: `${heightContent ? heightContent - 120 : 0}px` }}
                    className="absolute top-[50px] left-0 w-[210px] scroll-hidden overflow-y-auto ">
                    {searchResults.map((result, idx) => (
                        <div key={idx} className="py-2 border-b last:border-b-0 last:pb-0 cursor-pointer"
                            onClick={() => {
                                onResultClick(result.index + 1, searchTerm);
                                setSearchTerm('')
                            }}>
                            {/* Highlighting the match in the text */}
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: (result.text.length > 24
                                        ? result.text.slice(0, 24) + '...'
                                        : result.text).replace(
                                            new RegExp(`(${escapeRegExp(debouncedSearchTerm)})`, 'gi'),
                                            '<mark>$1</mark>'
                                        )
                                }}
                            />
                        </div>
                    ))}
                   
                    {searchResults.length === 0 && (
                        <label className="flex justify-center mt-[10px] text-sm">
                             Không tìm thấy kết quả
                        </label>
                    )}
                </div>


            </div>



        </SheetContent>
    </Sheet>

}
