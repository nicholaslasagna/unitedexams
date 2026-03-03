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

function looksLikeMathExpression(value: string) {
  const text = value.trim();
  if (!text) return false;

  // Keep real code-like snippets as code.
  if (
    /\b(add|addi|sub|lw|sw|beq|bne|jal|jalr|lui|ori|const|let|function|return)\b/i.test(text) ||
    /;|=>|===|&&|\|\|/.test(text)
  ) {
    return false;
  }

  return (
    /\\[a-zA-Z]+/.test(text) ||
    /\bdy\/dx\b|\bd\/dx\b|\bdy\b|\bdx\b/.test(text) ||
    /[a-zA-Z]'+/.test(text) ||
    /[=<>]/.test(text) ||
    /[\^_]/.test(text) ||
    /[∫√π∞≤≥]/.test(text) ||
    /[a-zA-Z0-9)\]]\s*[+\-*/]\s*[a-zA-Z0-9([\\]/.test(text)
  );
}

function promoteInlineMath(content: string) {
  return content.replace(/`([^`\n]+)`/g, (full, inner: string) => {
    const candidate = inner.trim();
    if (!looksLikeMathExpression(candidate)) return full;
    return `$${candidate}$`;
  });
}

export function Markdown({
  content,
  className = "",
  promoteMathInInlineCode = false
}: {
  content: string;
  className?: string;
  promoteMathInInlineCode?: boolean;
}) {
  const processedContent = promoteMathInInlineCode ? promoteInlineMath(content) : content;

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
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
