"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between py-3 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="CheckKal" width={32} height={32} priority />
          <span className="text-[22px] font-bold text-foreground tracking-[-0.3px] leading-7">
            CheckKal
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/category"
            className="text-foreground hover:text-primary transition-colors text-[16px] font-medium"
          >
            หมวดหมู่
          </Link>
          <Link
            href="/bmi-tdee"
            className="text-foreground hover:text-primary transition-colors text-[16px] font-medium"
          >
            BMI & TDEE
          </Link>
          <Link
            href="/blog"
            className="text-foreground hover:text-primary transition-colors text-[16px] font-medium"
          >
            บทความ
          </Link>
          <Link
            href="/search"
            className="ml-2 inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[13px] font-medium text-foreground border border-border bg-card hover:border-primary hover:text-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            ค้นหาอาหาร
          </Link>
        </nav>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/search"
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-[4px] text-[13px] font-semibold"
          >
            ค้นหาอาหาร
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-md text-foreground hover:bg-muted transition-colors"
            aria-label="เปิดเมนู"
          >
            {mobileOpen ? (
              /* X icon */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="flex flex-col px-4 py-2">
            <Link
              href="/category"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-[16px] font-medium text-foreground border-b border-border/50 hover:text-primary transition-colors"
            >
              หมวดหมู่
            </Link>
            <Link
              href="/bmi-tdee"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-[16px] font-medium text-foreground border-b border-border/50 hover:text-primary transition-colors"
            >
              BMI & TDEE
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-[16px] font-medium text-foreground hover:text-primary transition-colors"
            >
              บทความ
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
