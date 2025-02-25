import { type JSX, useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export const useMarkdown = (markdownContent: string | undefined) => {
	const [reactContent, setReactContent] = useState<JSX.Element | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const parseMarkdown = async () => {
			if (!markdownContent) {
				setReactContent(null);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				const file = await unified()
					.use(remarkParse)
					.use(remarkRehype)
					.use(rehypeSanitize) // XSS対策
					.use(rehypeReact, { jsx, jsxs, Fragment })
					.process(markdownContent);

				setReactContent(file.result as JSX.Element);
			} catch (err: unknown) {
				setError(
					err instanceof Error ? err : new Error("Unknown error occurred"),
				);
			} finally {
				setIsLoading(false);
			}
		};

		parseMarkdown();
	}, [markdownContent]);

	return { reactContent, isLoading, error };
};
