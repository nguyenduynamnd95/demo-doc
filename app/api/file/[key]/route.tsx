import { NextRequest, NextResponse } from "next/server";
import { getDocumentFile } from "@/services/server/document";

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
	const file = await getDocumentFile(params.key)
	return new NextResponse(file, {
		status: 200,
		headers: {
			'Content-Type': 'application/pdf',
		},
	})
}
