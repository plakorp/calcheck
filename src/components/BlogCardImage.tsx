'use client'

import { useState } from 'react'
import { getFallbackCover } from '@/lib/blog-cover-fallback'

type Props = {
  src: string | null | undefined
  alt: string
  fallbackCategory?: string | null
}

/**
 * Blog card cover image with graceful fallback:
 * - If src is null/empty → use category fallback
 * - If src errors (404) → swap to category fallback
 * - If fallback also errors → default cover
 */
export default function BlogCardImage({ src, alt, fallbackCategory }: Props) {
  const initial = src && src.startsWith('http') ? src : getFallbackCover(fallbackCategory)
  const [currentSrc, setCurrentSrc] = useState(initial)
  const [failed, setFailed] = useState(false)

  const handleError = () => {
    if (!failed) {
      setFailed(true)
      setCurrentSrc(getFallbackCover(fallbackCategory))
    }
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  )
}
