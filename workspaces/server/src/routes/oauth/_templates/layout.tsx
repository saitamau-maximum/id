import { jsxRenderer } from "hono/jsx-renderer";
import { factory } from "../../../factory";

declare module "hono" {
	interface ContextRenderer {
		// biome-ignore lint/style/useShorthandFunctionType: Duplicate identifier 'ContextRenderer' になってしまって困るので
		(content: string | Promise<string>, props: { title: string }): Response;
	}
}

const TITLE = "Maximum IdP OAuth";
const ORG_NAME = "埼玉大学 プログラミングサークル Maximum";

export const layoutRendererMiddleware = factory.createMiddleware(
	jsxRenderer(
		({ children, title }) => (
			<html lang="ja">
				<head>
					<meta charset="UTF-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"
					/>
					<meta name="robots" content="noindex" />
					<title>{`${title} | ${TITLE}`}</title>
					<script src="https://cdn.tailwindcss.com" />
				</head>
				<body>
					<main className="flex flex-col items-center justify-center p-4 w-screen h-screen">
						{children}
					</main>
					<footer className="text-sm text-gray-500 absolute bottom-2 w-full text-center">
						&copy; {new Date().getFullYear()} {ORG_NAME}
					</footer>
				</body>
			</html>
		),
		{ docType: true },
	),
);
