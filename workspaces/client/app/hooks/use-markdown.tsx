import { useEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import rehypeSanitize from "rehype-sanitize";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const markdownToReact = unified()
	.use(remarkParse)
	.use(remarkRehype)
	.use(rehypeSanitize)
	.use(rehypeReact, { jsx, jsxs, Fragment });

export const useMarkdown = (markdownContent: string | undefined) => {
	const [reactContent, setReactContent] = useState<React.ReactNode>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		const parseMarkdown = async () => {
			if (!markdownContent) {
				setReactContent(null);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				const file = await markdownToReact.process(markdownContent);

				if (isMounted.current) {
					setReactContent(file.result);
					setError(null);
				}
			} catch (err: unknown) {
				setReactContent(null);
				setError(
					err instanceof Error ? err : new Error("Unknown error occurred"),
				);
			} finally {
				setIsLoading(false);
			}
		};
		parseMarkdown();

		return () => {
			isMounted.current = false;
		};
	}, [markdownContent]);

	return { reactContent, isLoading, error };
};
