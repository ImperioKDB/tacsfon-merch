import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function BrandStatement() {
  return (
    <section
      aria-labelledby="brand-heading"
      className="relative overflow-hidden bg-bg-surface border border-border rounded-3xl mx-4 sm:mx-8 my-12 p-8 sm:p-16 lg:p-24 shadow-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
        <span className="font-body text-xs font-semibold tracking-widest uppercase text-accent mb-6 bg-accent/10 px-4 py-1.5 rounded-full">
          Who We Are
        </span>

        <h2
          id="brand-heading"
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none tracking-tight text-text-primary mb-2"
        >
          PREMIUM MERCH.
        </h2>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none tracking-tight text-accent mb-8">
          FELLOWSHIP SPIRIT.
        </h2>

        <p className="font-body text-base sm:text-lg text-text-muted leading-relaxed max-w-xl mb-10">
          TACSFON Merch exists to outfit the community with quality that reflects
          our values. Every piece is designed with intention — because what you
          wear says who you are.
        </p>

        <Link
          href="/about"
          className="inline-flex items-center gap-2 font-body text-sm font-medium tracking-wide uppercase text-bg-base bg-text-primary px-8 py-4 rounded-full transition-all hover:bg-accent hover:text-white"
        >
          Our Story <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
    </section>
  )
}
