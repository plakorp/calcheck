'use client'

import { useRouter } from 'next/navigation'
import type { Food } from '@/types/database'

interface Props {
  current: Food
  variants: Food[]
}

export function ServingSizeDropdown({ current, variants }: Props) {
  const router = useRouter()

  if (variants.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-sm border border-border rounded-[6px] px-3 py-1.5 text-foreground select-none">
        <span>หน่วยบริโภค {current.serving_size}</span>
      </div>
    )
  }

  return (
    <select
      value={current.slug}
      onChange={e => router.push(`/food/${e.target.value}`)}
      className="text-sm border border-border rounded-[6px] px-3 py-1.5 text-foreground bg-card cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-7 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22%23888%22 d=%22M6 8L1 3h10z%22/></svg>')] bg-no-repeat bg-[right_8px_center]"
      aria-label="เลือกหน่วยบริโภค"
    >
      {variants.map(v => (
        <option key={v.slug} value={v.slug}>
          {v.serving_size}
        </option>
      ))}
    </select>
  )
}
