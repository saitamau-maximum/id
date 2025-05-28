import { TOAST_MESSAGES, TOAST_SEARCHPARAM } from "@idp/server/shared/toast";
import { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router";
import { css } from "styled-system/css";
import { useToast } from "~/hooks/use-toast";

export default function Root() {
	// Server からのリダイレクト先は Dashboard かもしれないし Login かもしれないし invitation かもしれないので、
	// ここで Server からの Toast リクエストを処理する
	const [searchParams] = useSearchParams();
	const { pushToast } = useToast();

	useEffect(() => {
		const toastId = searchParams.get(TOAST_SEARCHPARAM);
		if (toastId) {
			const msg = TOAST_MESSAGES[toastId];
			if (msg) pushToast(msg);
		}
	}, [searchParams, pushToast]);

	return (
		<div
			className={css({
				margin: "6",
				width: "calc(100% - token(spacing.6) * 2)",
				height: "calc(100dvh - token(spacing.6) * 2)",
				overflow: "hidden",
				background: "white",
				borderRadius: "md",
				lgDown: {
					margin: "4",
					width: "calc(100% - token(spacing.4) * 2)",
					height: "calc(100dvh - token(spacing.4) * 2)",
				},
				mdDown: {
					margin: "2",
					width: "calc(100% - token(spacing.2) * 2)",
					height: "calc(100dvh - token(spacing.2) * 2)",
				},
			})}
		>
			<Outlet />
		</div>
	);
}
