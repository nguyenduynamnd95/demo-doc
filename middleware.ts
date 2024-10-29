import { NextRequest, NextResponse } from "next/server";
import { isAdmin, isAuthorized } from "@/services/server/kintone";

export function middleware(req: NextRequest) {
	const adminPaths = [
		'/reports',
	]
	const { pathname } = req.nextUrl
	if (!isAuthorized()) {
		return NextResponse.redirect(new URL('/login', req.url));
	}
	if (adminPaths.some(path => pathname.startsWith(path)) && !isAdmin()) {
		return NextResponse.redirect(new URL('/', req.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login
     * - api/oauth2
     * - images/*
     */
		'/((?!_next/static|_next/image|favicon.ico|login|api/oauth2|images/*).*)',
	]
};
