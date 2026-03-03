import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import type { ReactNode } from "react";

function flattenText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return flattenText((node as { props?: { children?: ReactNode } }).props?.children ?? "");
  }
  return "";
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function Markdown({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          h2: ({ children }) => <h2 id={slug(flattenText(children))}>{children}</h2>,
          h3: ({ children }) => <h3 id={slug(flattenText(children))}>{children}</h3>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
