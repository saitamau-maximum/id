import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect, type JSX } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeReact from 'rehype-react';

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
          .use(rehypeSanitize) // XXS対策
          .use(rehypeReact, { jsx, jsxs, Fragment })
          .process(markdownContent);

        setReactContent(file.result as JSX.Element);
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    parseMarkdown();
  }, [markdownContent]);

  return { reactContent, isLoading, error };
};
