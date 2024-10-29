import { NextRequest } from "next/server";
import { addNote, getNotes } from "@/services/server/document";

export async function GET(request: NextRequest, { params }: { params: { docVerId: number } }) {	
	const notes = await getNotes(params.docVerId)
	return Response.json(notes.records)
}

export async function POST(request: NextRequest, { params }: { params: { docVerId: number } }) {
	const body = await request.json()
	const newNote = await addNote(params.docVerId, body)
	return Response.json(newNote)
}
