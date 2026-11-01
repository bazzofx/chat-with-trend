import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"

interface MarkdownRendererProps {
  content: string
}

function childrenToString(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(childrenToString).join("")
  }

  if (React.isValidElement(children)) {
    return childrenToString((children.props as { children?: React.ReactNode }).children)
  }

  return ""
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border/50 bg-muted/30">
      <div className="px-4 py-2 bg-muted/50 border-b border-border/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-2 capitalize">{language}</span>
        </div>
        {/* optional: you can add a copy button here later */}
      </div>

      <pre className="p-4 overflow-x-auto">
        <code
          className="font-mono text-sm text-foreground/90 whitespace-pre"
          data-language={language}
        >
          {code}
        </code>
      </pre>
    </div>
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    // Headings
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground border-b border-border pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mt-5 mb-3 text-foreground border-b border-border/50 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold mt-3 mb-2 text-foreground">{children}</h4>
    ),

    // Paragraphs
    p: ({ children }) => <p className="mb-4 leading-relaxed text-foreground/90">{children}</p>,

    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-foreground/90">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground/90">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,

    // Block code is wrapped in <pre> by react-markdown. Rendering the whole block
    // here (instead of in `code`) keeps block-level tags out of paragraphs.
    pre: ({ children }) => {
      const child = React.Children.toArray(children)[0]

      if (!React.isValidElement(child)) {
        return (
          <pre className="my-4 p-4 overflow-x-auto rounded-lg border border-border/50 bg-muted/30">
            {children}
          </pre>
        )
      }

      const codeProps = child.props as { className?: string; children?: React.ReactNode }
      const language = (codeProps.className || "").replace(/^language-/, "") || "code"
      const code = childrenToString(codeProps.children).replace(/^\n+|\n+$/g, "")

      return <CodeBlock language={language} code={code} />
    },

    // Inline code only; block code is handled by `pre` above.
    code: ({ className, children }) => (
      <code
        className={
          className ||
          "px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-sm border border-primary/20"
        }
      >
        {children}
      </code>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-foreground/80 bg-primary/5 rounded-r">
        {children}
      </blockquote>
    ),

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),

    // Strong/Bold
    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,

    // Emphasis/Italic
    em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,

    // Horizontal rule
    hr: () => <hr className="my-6 border-border" />,

    // Tables
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-2 text-left font-semibold text-foreground border-r border-border last:border-0">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-foreground/90 border-r border-border last:border-0">{children}</td>
    ),
  }

  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
