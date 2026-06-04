'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90dvh] flex items-center justify-center bg-[#050505] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3DBA6F10_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
        <p className="font-body text-[10px] font-black uppercase tracking-[0.5em] text-[#3DBA6F]">
          TACSFON // PREMIUM_COLLECTION_2026
        </p>
        <h1 className="font-display text-[clamp(60px,15vw,120px)] leading-[0.85] uppercase tracking-tighter italic text-white">
          Wear the <br/> <span className="text-[#3DBA6F]">Culture.</span>
        </h1>
        <p className="font-body text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed tracking-tight">
          A Nigerian streetwear identity built on faith and excellence.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/products" className="w-full sm:w-auto px-12 py-4 bg-[#3DBA6F] text-black font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-all">
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  )
}