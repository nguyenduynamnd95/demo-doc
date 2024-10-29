import { NextRequest } from "next/server";
import { deleteNote, updateNote } from "@/services/server/document";


export async function PUT(request: NextRequest, { params }: { params: { noteId: number } }) {
	const body = await request.json()
	const newNote = await updateNote(params.noteId, body)
	return Response.json(newNote)
}

export async function DELETE(request: NextRequest, { params }: { params: { noteId: number } }) {
	await deleteNote(params.noteId)
	return Response.json({})
}
