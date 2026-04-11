/**
 * Strip leading emoji(s) and whitespace from a blog title.
 * "🥑 คีโต Keto คืออะไร?" → "คีโต Keto คืออะไร?"
 */
export function stripTitleEmoji(title: string): string {
  if (!title) return title
  // Remove any leading emoji/symbol/punctuation/whitespace sequences
  return title.replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}\s\u200d\ufe0f]+/u, '').trim()
}
