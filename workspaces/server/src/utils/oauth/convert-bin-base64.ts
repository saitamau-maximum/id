export const base64ToBinary = (base64: string) =>
	Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

export const binaryToBase64 = (bin: Uint8Array) =>
	btoa(String.fromCharCode(...bin));

export const binaryToBase64Url = (bin: Uint8Array) =>
	binaryToBase64(bin)
		.replaceAll("=", "")
		.replaceAll("+", "-")
		.replaceAll("/", "_");
