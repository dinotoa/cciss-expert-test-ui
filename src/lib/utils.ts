import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function markdownToText(markdown: string): string {
  return (
    markdown
      // Remove headers
      .replace(/#{1,6}\s?/g, "")
      // Remove blockquotes
      .replace(/>\s/g, "")
      // Remove bold/italic
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      // Remove links
      .replace(/\[([^\]]+)\]$$[^$$]+\)/g, "$1")
      // Remove code blocks
      .replace(/`{3}[\s\S]*?`{3}/g, "")
      // Remove inline code
      .replace(/`(.+?)`/g, "$1")
      // Remove horizontal rules
      .replace(/^-{3,}|^\*{3,}$/gm, "")
      // Remove strikethrough
      .replace(/~~(.*?)~~/g, "$1")
      // Remove images
      .replace(/!\[([^\]]+)\]$$[^$$]+\)/g, "$1")
      // Remove HTML tags
      .replace(/<[^>]+>/g, "")
      // Remove extra newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
}
