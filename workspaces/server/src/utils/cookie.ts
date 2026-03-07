export const getCookieDomain = (env: Env["ENV"]) => {
	if (env === "production") {
		return "api.id.maximum.vc" as const;
	}
	if (env === "preview") {
		return "api-preview.id.maximum.vc" as const;
	}
	return undefined;
};

export const getDeleteCookieOptions = (env: Env["ENV"]) => {
	return { path: "/", secure: true, domain: getCookieDomain(env) } as const;
};
