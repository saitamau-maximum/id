import { useEffect, useState, useCallback, useRef } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeReact from "rehype-react";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";

export const useMarkdown = (markdownContent: string | undefined) => {
    const [reactContent, setReactContent] = useState<React.ReactNode>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
	const isMounted = useRef(true);

    const parseMarkdown = useCallback(async () => {
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
                .use(rehypeSanitize)
                .use(rehypeReact, { jsx, jsxs, Fragment })
                .process(markdownContent);
			
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
    }, [markdownContent]);

    useEffect(() => {
        isMounted.current = true;
        parseMarkdown();

        return () => {
            isMounted.current = false;
        };
    }, [parseMarkdown]);

    return { reactContent, isLoading, error };
};
