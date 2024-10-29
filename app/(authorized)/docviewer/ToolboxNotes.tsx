import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { DocNote } from "@/types/main";

export type ToolBoxNotesProps = {
	open: boolean
	setOpen: (isOpen: boolean) => void
	notes: DocNote[]
	onNoteClick: (note: DocNote) => void
}
export default function ToolboxNotes({ open, setOpen, notes, onNoteClick }: ToolBoxNotesProps) {
	const t = useTranslations('docviewer')

	return <Dialog open={open} onOpenChange={setOpen}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{t('notes')}</DialogTitle>
				<DialogDescription></DialogDescription>
			</DialogHeader>
			<div className="flex flex-col max-h-80 overflow-y-auto">
				{notes.map((note, idx) => (
					<div key={idx} className="py-2 border-b last:border-b-0 last:pb-0 cursor-pointer"
					     onClick={() => {
						     onNoteClick(note);
					     }}>
						<div className="flex gap-5 leading-4 text-xs mb-2">
							<p><mark>{note.highlight}</mark></p>
							<span className="ml-auto text-muted-foreground">{note.page}</span>
						</div>

						{note.content ? <p>{note.content}</p> : ''}
					</div>
				))}
			</div>
		</DialogContent>
	</Dialog>
}
