export type DocNote = {
	id: number
	page: number
	highlight: string
	scope: TextScopeRect[]
	content: string
}

export type DocNoteUpsertParams = {
	page: number
	highlight: string
	scope: TextScopeRect[]
	content: string
}

export type TextScopeRect = {
	top: number
	left: number
	width: number
	height: number
}

export type FileInformation = {
	contentType: string;
	fileKey: string;
	name: string;
	size: string;
}

export type DocVersion = {
	id: number
	documentId: number
	documentTitle: string
	version: string
	file: FileInformation[]
	updatedAt: Date
}

export type Doc = {
	id: number
	title: string
	description?: string
	createdBy: { code: string, name: string }
	createdAt: Date
}
