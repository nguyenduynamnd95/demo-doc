import { Doc, DocNote, DocNoteUpsertParams, DocVersion, FileInformation } from "@/types/main";
import { addRecord, deleteRecords, downloadFile, getRecord, getRecords, updateRecord } from "@/services/server/kintone";


export async function getDocuments() {
	const data = await getRecords({
		app: `${process.env.KINTONE_APP_ID_DOCUMENTS}`,
		totalCount: true,
	})
	return {
		...data,
		records: data.records.map(rec => _mapDoc(rec))
	}
}

function _mapDoc(record: Record<string, { value: unknown }>): Doc {
	return {
		id: Number(record.id.value),
		title: record.title.value as string,
		description: record.description.value as string,
		createdBy: record.createdBy.value as { code: string, name: string },
		createdAt: new Date(record.createdAt.value as string),
	}
}

export async function getDocumentVersions(docIds: number[]) {
	const data = await getRecords({
		app: `${process.env.KINTONE_APP_ID_DOCUMENT_VERSIONS}`,
		query: `documentId in (${docIds.join(',')})`,
		totalCount: true,
	})
	return {
		...data,
		records: data.records.map(rec => _mapDocVersion(rec))
	}
}

export async function getDocumentVersion(docVerId: number) {
	const data = await getRecord({
		app: `${process.env.KINTONE_APP_ID_DOCUMENT_VERSIONS}`,
		id: docVerId,
	})
	return _mapDocVersion(data.record)
}

export async function getDocumentFile(fileKey: string) {
	return await downloadFile({ fileKey })
}

function _mapDocVersion(record: Record<string, { value: unknown }>): DocVersion {
	return {
		id: Number(record.id.value),
		documentId: Number(record.documentId.value),
		documentTitle: record.documentTitle.value as string,
		version: record.version.value as string,
		file: record.file.value as FileInformation[],
		updatedAt: new Date(record.updatedAt.value as string),
	}
}

export async function getNotes(docVerId: number) {
	const data = await getRecords({
		app: `${process.env.KINTONE_APP_ID_DOCUMENT_NOTES}`,
		totalCount: true,
		query: `documentVersionId = "${docVerId}" and createdBy in (LOGINUSER())`,
	})
	return {
		...data,
		records: data.records.map(rec => _mapDocNote(rec))
	}
}

function _mapDocNote(record: Record<string, { value: unknown }>): DocNote {
	return {
		id: Number(record.id.value),
		page: Number(record.page.value),
		highlight: record.highlight.value as string,
		scope: JSON.parse(record.scope.value as string),
		content: record.content.value as string,
	}
}

function _mapDocNoteRecord(params: DocNoteUpsertParams) {
	return {
		page: {
			value: params.page,
		},
		highlight: {
			value: params.highlight,
		},
		scope: {
			value: JSON.stringify(params.scope),
		},
		content: {
			value: params.content,
		},
	}
}

export async function addNote(docVerId: number, params: DocNoteUpsertParams) {
	return await addRecord({
		app: `${process.env.KINTONE_APP_ID_DOCUMENT_NOTES}`,
		record: {
			..._mapDocNoteRecord(params),
			documentVersionId: {
				value: docVerId,
			}
		},
	})
}

export async function updateNote(noteId: number, params: DocNoteUpsertParams) {
	return await updateRecord({
		app: `${process.env.KINTONE_APP_ID_DOCUMENT_NOTES}`,
		id: noteId,
		record: {
			..._mapDocNoteRecord(params),
		},
	})
}

export async function deleteNote(noteId: number) {
	return await deleteRecords({
		app: `${process.env.KINTONE_APP_ID_DOCUMENT_NOTES}`,
		ids: [noteId],
	})
}
