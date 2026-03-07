import { useCallback, useEffect } from "react";
import { type MetaFunction, useNavigate, useSearchParams } from "react-router";
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
				if (res.ok) navigate(redirectTo);
				else navigate("/login");
			} catch {
				navigate("/login"); // retry
			}
		},
		[navigate],
	);

	useEffect(() => {
		const ott = param.get("ott");
		const rawRedirectTo = param.get("redirect_to") ?? "/";
		// オープンリダイレクト防止: 同一オリジンのURLだけ許可し、相対パスへ正規化
		const redirectTo = (() => {
			try {
				const parsed = new URL(rawRedirectTo, window.location.origin);
				if (parsed.origin !== window.location.origin) return "/";
				return `${parsed.pathname}${parsed.search}${parsed.hash}`;
			} catch {
				return "/";
			}
		})();
		if (ott) verifyAndRedirect(ott, redirectTo);
		else navigate("/login");
	}, [param, verifyAndRedirect, navigate]);
}
