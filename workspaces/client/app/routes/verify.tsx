import { useCallback, useEffect } from "react";
import { type MetaFunction, useNavigate, useSearchParams } from "react-router";
import { JWT_STORAGE_KEY } from "~/constant";
import { client } from "~/utils/hono";

export const meta: MetaFunction = () => {
	return [{ title: "Loading..." }];
};

export default function Verify() {
	const [param] = useSearchParams();
	const navigate = useNavigate();

	const verifyAndRedirect = useCallback(
		async (ott: string, redirectTo: string) => {
			try {
				const res = await client.auth.verify.$get({
					query: {
						ott,
					},
				});
				if (res.ok) {
					const payload = await res.json();
					sessionStorage.setItem(JWT_STORAGE_KEY, payload.jwt);
					navigate(redirectTo);
				}
			} catch {
				navigate("/login"); // retry
			}
		},
		[navigate],
	);

	useEffect(() => {
		const ott = param.get("ott");
		const rawRedirectTo = param.get("redirect_to") ?? "/";
		// オープンリダイレクト防止: `/` 始まりかつ `//` でないパスのみ許可
		const redirectTo =
			rawRedirectTo.startsWith("/") && !rawRedirectTo.startsWith("//")
				? rawRedirectTo
				: "/";
		if (ott) verifyAndRedirect(ott, redirectTo);
		else navigate("/login");
	}, [param, verifyAndRedirect, navigate]);
}
