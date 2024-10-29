import { cookies } from "next/headers";
import { decrypt, encrypt, getBase64 } from "@/services/server/utils";

export type GetAccessTokenResponse = {
	access_token: string
	refresh_token: string
	token_type: string
	expires_in: number
	scope: string
}

export type RefreshAccessTokenResponse = {
	access_token: string
	token_type: string
	expires_in: number
	scope: string
}

export type GetRecordsResponse = {
	records: Record<string, { value: unknown }>[]
	totalCount: number
}

export type GetRecordResponse = {
	record: Record<string, { value: unknown }>
}

export function getAuthorizationUrl() {
	const scope = [
		'k:app_record:read',
		'k:app_record:write',
		'k:file:read',
	].join(' ')
	return encodeURI(`${process.env.CYBOZU_AUTHORIZATION_ENDPOINT}?client_id=${process.env.CYBOZU_CLIENT_ID}&redirect_uri=${process.env.CYBOZU_AUTHORIZATION_REDIRECT_URL}&state=state1&response_type=code&scope=${scope}`)
}

export async function setupOAuthToken(authorizationCode: string) {
	const data: GetAccessTokenResponse = await fetch(`${process.env.CYBOZU_TOKEN_ENDPOINT}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${getBase64(`${process.env.CYBOZU_CLIENT_ID}:${process.env.CYBOZU_CLIENT_SECRET}`)}`,
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			redirect_uri: encodeURI(`${process.env.CYBOZU_AUTHORIZATION_REDIRECT_URL}`),
			code: authorizationCode,
		}).toString(),
	}).then(res => res.json())
	cookies().set('X-Access-Token', data.access_token, {
		secure: true,
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		priority: 'high',
		maxAge: data.expires_in - 10,
	})
	cookies().set('X-Refresh-Token', data.refresh_token, {
		secure: true,
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		priority: 'high',
	})
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshAccessTokenResponse> {
	return fetch(`${process.env.CYBOZU_TOKEN_ENDPOINT}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${getBase64(`${process.env.CYBOZU_CLIENT_ID}:${process.env.CYBOZU_CLIENT_SECRET}`)}`,
		},
		body: new URLSearchParams({
			grant_type: 'X-Refresh-Token',
			refresh_token: refreshToken,
		}).toString(),
	}).then(res => res.json())
}

export function isAuthorized() {
	return cookies().has('X-Basic-Username') && cookies().has('X-Basic-Password')
		|| cookies().has('X-Access-Token')
}

export async function isAdmin() {
	if (cookies().has('X-Is-Admin')) {
		const value = await decrypt(`${cookies().get('X-Is-Admin')?.value}`)
		return '1' === value
	}
	return false
}

export function signout() {
	cookies().delete('X-Access-Token')
	cookies().delete('X-Refresh-Token')
	cookies().delete('X-Basic-Username')
	cookies().delete('X-Basic-Password')
	cookies().delete('X-Is-Admin')
}

export async function loginAsAdmin(usn: string, pwd: string) {
	const data = await fetch(`${process.env.CYBOZU_REST_BASE_URL}/v1/user/groups.json?code=${usn}`, {
		method: 'GET',
		headers: {
			...await _getPwdAuthHeader(usn, pwd),
		}
	}).then(res => res.json());
	
	if (!data['groups'])
		return false
	const isAdmin = data['groups'].some((grp: Record<string, string>) => grp['code'] === 'Administrators')
	cookies().set('X-Basic-Username', await encrypt(usn), {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		priority: 'high',
		maxAge: 86400
	})
	cookies().set('X-Basic-Password', await encrypt(pwd), {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		priority: 'high',
		maxAge: 86400
	})
	// 1: admin, 2: user
	cookies().set('X-Is-Admin', await encrypt( isAdmin ? '1' : '2'), {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 86400
	})
	return true
}

function _getOAuthHeader(token?: string) {
	return {
		'Authorization': `Bearer ${token ?? cookies().get('X-Access-Token')?.value}`
	}
}

async function _getPwdAuthHeader(usn?: string, pwd?: string) {
	const username = usn ?? await decrypt(`${cookies().get('X-Basic-Username')?.value}`)
	const password = pwd ?? await decrypt(`${cookies().get('X-Basic-Password')?.value}`)
	return {
		'X-Cybozu-Authorization': getBase64(`${username}:${password}`),
	}
}

async function _request(path: 'records' | 'record' | 'file', method: 'get' | 'post' | 'put' | 'delete', query?: Record<string, unknown>, body?: unknown) {
	const queryString = query ? '?' + Object.entries(query)
		.map(([key, value]) => `${key}=${value}`)
		.join('&') : ''
	const url = encodeURI(`${process.env.CYBOZU_REST_BASE_URL}/k/v1/${path}.json${queryString}`)
	const authHeader = cookies().has('X-Basic-Username') && cookies().has('X-Basic-Password')
		? await _getPwdAuthHeader()
		: cookies().has('X-Access-Token')
			? _getOAuthHeader()
			: {}
	return await fetch(url, {
		method,
		headers: {
			...authHeader,
			...(method === 'post' || method === 'put' ? { 'Content-Type': 'application/json' } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
	})
}

export async function getRecords(params: {
	app: number | string
	totalCount?: boolean
	query?: string
}): Promise<GetRecordsResponse> {
	return await _request('records', 'get', params).then(res => res.json())
}

export async function getRecord(params: { app: number | string, id: number | string }): Promise<GetRecordResponse> {
	return await _request('record', 'get', params).then(res => res.json())
}

export async function addRecord(body: { app: number | string, record: Record<string, { value: unknown }> }) {
	return await _request('record', 'post', undefined, body).then(res => res.json())
}

export async function updateRecord(body: {
	app: number | string
	id: number | string
	record: Record<string, { value: unknown }>
}) {
	return await _request('record', 'put', undefined, body).then(res => res.json())
}

export async function deleteRecords(params: { app: number | string, ids: (number | string)[] }) {
	return await _request('records', 'delete', params).then(res => res.json())
}

export async function downloadFile(params: { fileKey: string }) {
	return await _request('file', 'get', params).then(res => res.blob())
}
