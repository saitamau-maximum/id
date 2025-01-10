import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";

interface LayoutProps {
	children: HtmlEscapedString | Promise<HtmlEscapedString>;
	subtitle?: string;
}

const TITLE = "Maximum Auth";
const ORG_NAME = "埼玉大学 プログラミングサークル Maximum";

export const _Layout = ({ subtitle, children }: LayoutProps) => html`
  <!doctype html>
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="noindex" />
      <title>${subtitle ? `${subtitle} | ${TITLE}` : TITLE}</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <main
        class="flex flex-col items-center justify-center p-4 w-screen h-screen"
      >
        ${children}
      </main>
      <footer
        class="text-sm text-gray-500 absolute bottom-2 w-full text-center"
      >
        &copy; ${new Date().getFullYear()} ${ORG_NAME}
      </footer>
    </body>
  </html>
`;
