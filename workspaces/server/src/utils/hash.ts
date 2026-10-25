export const sha256 = async (data: Uint8Array) => {
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	return new Uint8Array(hashBuffer);
};

export const sha512 = async (data: Uint8Array) => {
	const hashBuffer = await crypto.subtle.digest("SHA-512", data);
	return new Uint8Array(hashBuffer);
};

export const digestToHex = (hash: Uint8Array) => {
	return Array.from(hash)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
};
