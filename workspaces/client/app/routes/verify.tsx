import { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { JWT_STORAGE_KEY } from "~/constant";
import { client } from "~/utils/hono";

export const meta: MetaFunction = () => {
	return [{ title: "Loading..." }];
};

export default function Verify() {
	const [param] = useSearchParams();
	const navigate = useNavigate();

	const getJwt = useCallback(
		async (ott: string) => {
			try {
				const res = await client.auth.verify.$get({
					query: {
						ott,
					},
				});
				if (res.ok) {
					const payload = await res.json();
					localStorage.setItem(JWT_STORAGE_KEY, payload.jwt);
					navigate("/");
				}
			} catch {
				navigate("/login"); // retry
			}
		},
		[navigate],
	);

	useEffect(() => {
		const ott = param.get("ott");
		if (ott) getJwt(ott);
		else navigate("/login");
	}, [param, getJwt, navigate]);
}
