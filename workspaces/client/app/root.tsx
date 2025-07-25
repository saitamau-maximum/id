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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main>
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre>
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
