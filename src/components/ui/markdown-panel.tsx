"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import remarkImages from 'remark-images'

interface MarkdownDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string
}

export function MarkdownPanel({ className, content, ...props }: MarkdownDisplayProps) {
  return (
    <ReactMarkdown className={cn("w-full", className)} {...props}
      components={{
        h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mb-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mb-2" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
        th: ({ node, ...props }) => <td className="border px-2 py-1 bg-neutral-200 font-bold" {...props} />,
        td: ({ node, ...props }) => <td className="border px-2 py-1" {...props} />,
        table: ({ node, ...props }) => <table className="mb-4" {...props} />,
        pre: ({ node, ...props }) => <pre className="p-4 mb-4 text-wrap" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4" {...props} />
        ),
      }}
      remarkPlugins={[remarkGfm, remarkImages]}
    >
      {content}
    </ReactMarkdown>
  )
}

