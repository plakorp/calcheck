'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

type Props = { content: string }

/**
 * Renders blog content that may contain either Markdown (##, **, lists)
 * or raw HTML (<h2>, <p>, <ul>) — or a mix of both.
 *
 * - remark-gfm: tables, strikethrough, task lists, autolinks
 * - rehype-raw: allows raw HTML tags inside the markdown tree
 */
export default function BlogContent({ content }: Props) {
  return (
    <div className="prose prose-neutral max-w-none text-[#36342e] prose-headings:font-semibold prose-headings:text-[#201515] prose-h1:text-[28px] prose-h2:text-[22px] prose-h3:text-[18px] prose-p:leading-relaxed prose-strong:text-[#201515] prose-a:text-[#ff4f00] prose-a:no-underline hover:prose-a:underline prose-li:my-1 prose-ul:my-4 prose-ol:my-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
