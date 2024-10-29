import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { setupOAuthToken } from "@/services/server/kintone";

export async function GET(request: NextRequest) {
	if (request.nextUrl.searchParams.has('code')) {
		await setupOAuthToken(`${request.nextUrl.searchParams.get('code')}`)
		redirect('/')
	}
	if (request.nextUrl.searchParams.has('error')) {
		redirect(`/login?error=${request.nextUrl.searchParams.get('error')}`)
	}
	redirect('/login?error=access_denied')
}
