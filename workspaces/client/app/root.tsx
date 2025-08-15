import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
} from "react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { css } from "styled-system/css";
import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import { RoleSelector } from "./components/feature/user/role-selector";
import { UserSelector } from "./components/feature/user/user-selector";
import { ConfirmDialog } from "./components/logic/callable/comfirm";
import { InformationDialog } from "./components/logic/callable/information";
import { ButtonLike } from "./components/ui/button-like";
import { InvitationProvider } from "./hooks/use-invitation/invitation-provider";
import { RepositoryProvider } from "./hooks/use-repository";
import { ToastProvider } from "./hooks/use-toast/toast-provider";
import { initializeEnv } from "./utils/env";

initializeEnv();

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Sans+JP:wght@100..900&display=swap",
	},
	{ rel: "stylesheet", href: stylesheet },
];

export const meta: Route.MetaFunction = () => {
	return [
		{ title: "Maximum IdP" },
		{
			name: "description",
			content:
				"埼玉大学のプログラミングサークル「Maximum」のメンバーのみが利用可能なプロフィールシステム「Maximum IdP」です。",
		},
		{
			name: "robots",
			content: "noindex, nofollow",
		},
	];
};

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body
				className={css({
					backgroundGradient: "primary",
					fontFamily: '"Inter", "Noto Sans JP", sans-serif',
					backgroundRepeat: "no-repeat",
					width: "100%",
					height: "100dvh",
					overflow: "hidden",
				})}
			>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

export default function App() {
	return (
		<RepositoryProvider>
			<QueryClientProvider client={queryClient}>
				<ToastProvider>
					<InvitationProvider>
						<Outlet />
						<UserSelector.Root />
						<RoleSelector.Root />
						<ConfirmDialog.Root />
						<InformationDialog.Root />
					</InvitationProvider>
				</ToastProvider>
			</QueryClientProvider>
		</RepositoryProvider>
	);
}

function ClassifyError(error: unknown) {
	if (!isRouteErrorResponse(error)) {
		return undefined;
	}

	const status = error.status;

	if (status === 404) {
		return {
			status_code: status,
			error_title: "Not Found",
			error_message:
				"お探しのページは削除・移動した可能性があります。URLをご確認ください。",
		};
	}

	if (status === 400) {
		return {
			status_code: status,
			error_title: "Bad Request",
			error_message:
				"リクエストの内容に問題があります。入力内容をご確認ください。",
		};
	}

	if (status === 401) {
		return {
			status_code: status,
			error_title: "Unauthorized",
			error_message: "この操作を行うにはログインが必要です。",
		};
	}

	if (status === 403) {
		return {
			status_code: status,
			error_title: "Forbidden",
			error_message:
				"この操作を行う権限がありません。Adminにお問い合わせください。",
		};
	}

	if (status === 405) {
		return {
			status_code: status,
			error_title: "Method Not Allowed",
			error_message: "指定されたメソッドは許可されていません。",
		};
	}

	if (status === 409) {
		return {
			status_code: status,
			error_title: "Conflict",
			error_message: "リクエストが現在のリソースの状態と競合しています。",
		};
	}

	if (status === 422) {
		return {
			status_code: status,
			error_title: "Unprocessable Entity",
			error_message:
				"送信されたデータに問題があります。入力内容をご確認ください。",
		};
	}

	if (status === 429) {
		return {
			status_code: status,
			error_title: "Too Many Requests",
			error_message:
				"短時間に多くのリクエストが送信されました。しばらく待ってから再度お試しください。",
		};
	}

	if (status >= 400 && status < 500) {
		return {
			status_code: status,
			error_title: "Client Error",
			error_message:
				"リクエストに問題があります。しばらく待ってから再度お試しください。",
		};
	}

	if (status === 500) {
		return {
			status_code: status,
			error_title: "Internal Server Error",
			error_message:
				"サーバーで予期しないエラーが発生しました。しばらく待ってから再度お試しください。",
		};
	}

	if (status === 502) {
		return {
			status_code: status,
			error_title: "Bad Gateway",
			error_message:
				"サーバーへの接続に問題があります。しばらく待ってから再度お試しください。",
		};
	}

	if (status === 503) {
		return {
			status_code: status,
			error_title: "Service Unavailable",
			error_message:
				"現在サービスが利用できません。メンテナンス中の可能性があります。",
		};
	}

	if (status === 504) {
		return {
			status_code: status,
			error_title: "Gateway Timeout",
			error_message:
				"サーバーからの応答がタイムアウトしました。しばらく待ってから再度お試しください。",
		};
	}

	if (status >= 500) {
		return {
			status_code: status,
			error_title: "Server Error",
			error_message:
				"サーバーでエラーが発生しました。しばらく待ってから再度お試しください。",
		};
	}

	return {
		status_code: status,
		error_title: "Error",
		error_message: error.statusText || "予期しないエラーが発生しました。",
	};
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	const { status_code, error_title, error_message } = ClassifyError(error) ?? {
		status_code: 500,
		error_title: "Unexpected Error",
		error_message: "予期しないエラーが発生しました。",
	};

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
			<div
				className={css({
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "6",
					justifyContent: "center",
					height: "100%",
					color: "gray.600",
					paddingLeft: "4",
					paddingRight: "4",
				})}
			>
				<h1
					className={css({
						fontSize: "6xl",
						fontWeight: "bold",
					})}
				>
					{status_code}
				</h1>
				<p
					className={css({
						fontSize: "2xl",
						fontWeight: "bold",
					})}
				>
					{error_title}
				</p>
				<p>{error_message}</p>
				<ButtonLike>
					<a href="/">トップページに戻る</a>
				</ButtonLike>
			</div>
		</div>
	);
}
