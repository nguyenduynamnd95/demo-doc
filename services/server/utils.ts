export function getBase64(str: string) {
	return Buffer.from(str).toString('base64')
}

function checkSecretKey(key?: string) {
	if (!key)
		throw new Error('SECRET_KEY is not defined');
	return key
}

async function create256BitKeyFromString(inputString: string): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const keyMaterial = encoder.encode(inputString);

	// Use the first 32 bytes of the keyMaterial
	return crypto.subtle.importKey(
		'raw',
		keyMaterial.slice(0, 32), // Ensure key length is 32 bytes (256 bits)
		{ name: 'AES-CTR' },
		false,
		['encrypt', 'decrypt']
	);
}

export async function encrypt(text: string): Promise<string> {
	const key = await create256BitKeyFromString(checkSecretKey(process.env.SECRET_KEY));
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV

	const encryptedData = await crypto.subtle.encrypt(
		{
			name: 'AES-CTR',
			counter: iv,
			length: 64,
		},
		key,
		data
	);

	// Concatenate IV and encrypted data into a single string
	const ivString = Array.from(iv).map(byte => byte.toString(16).padStart(2, '0')).join('');
	const encryptedString = Array.from(new Uint8Array(encryptedData)).map(byte => byte.toString(16).padStart(2, '0')).join('');

	return `${ivString}:${encryptedString}`;
}

export async function decrypt(encrypted: string): Promise<string> {
	const key = await create256BitKeyFromString(checkSecretKey(process.env.SECRET_KEY));
	const [ivHex, encryptedDataHex] = encrypted.split(':');

	const iv = Uint8Array.from(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
	const encryptedData = Uint8Array.from(encryptedDataHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

	const decryptedData = await crypto.subtle.decrypt(
		{
			name: 'AES-CTR',
			counter: iv,
			length: 64,
		},
		key,
		encryptedData
	);

	const decoder = new TextDecoder();
	return decoder.decode(decryptedData);
}
