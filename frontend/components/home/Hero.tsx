'use client'

/**
 * Hero
 *
 * Clean, premium hero with animated gradient orb background.
 * No corner brackets, no horizontal lines — those hurt the light theme.
 *
 * Background: animated floating green orb + subtle mesh pattern.
 * Works in both dark and light mode via CSS vars.
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section
      aria-label="Hero"
      style={{
        position:       'relative',
        width:          '100%',
        minHeight:      '100dvh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
        background:     'var(--bg-base)',
      }}
    >
      {/* ── Animated orb 1 — large, slow float ── */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          top:          '-10%',
          left:         '-15%',
          width:        '70vw',
          height:       '70vw',
          maxWidth:     '600px',
          maxHeight:    '600px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(61,186,111,0.18) 0%, transparent 70%)',
          animation:    'hero-float-1 12s ease-in-out infinite',
          pointerEvents:'none',
          filter:       'blur(40px)',
        }}
      />

      {/* ── Animated orb 2 — smaller, faster ── */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          bottom:       '-5%',
          right:        '-10%',
          width:        '50vw',
          height:       '50vw',
          maxWidth:     '420px',
          maxHeight:    '420px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(61,186,111,0.12) 0%, transparent 70%)',
          animation:    'hero-float-2 9s ease-in-out infinite',
          pointerEvents:'none',
          filter:       'blur(50px)',
        }}
      />

      {/* ── Subtle dot grid overlay ── */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          inset:      0,
          backgroundImage: `radial-gradient(circle, rgba(61,186,111,0.07) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          animation:  'hero-grid-fade 6s ease-in-out infinite alternate',
        }}
      />

      {/* ── Content ── */}
      <div
        style={{
          position:   'relative',
          zIndex:     1,
          maxWidth:   '900px',
          margin:     '0 auto',
          padding:    '0 24px',
          textAlign:  'center',
        }}
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-body text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-accent mb-8 flex items-center justify-center gap-4 py-2 px-6 rounded-full bg-accent/10 w-max mx-auto shadow-sm"
        >
          TACSFON Community Merch
        </motion.p>

        {/* Headline */}
        <h1
          className="animate-fade-in stagger-1"
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(56px, 11vw, 128px)',
            lineHeight:    0.92,
            letterSpacing: '0.01em',
            color:         'var(--text-primary)',
            marginBottom:  0,
          }}
        >
          WEAR THE
        </h1>
        <h1
          className="animate-fade-in stagger-2"
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(56px, 11vw, 128px)',
            lineHeight:    0.92,
            letterSpacing: '0.01em',
            color:         'var(--accent)',
            marginBottom:  '32px',
          }}
        >
          MISSION
        </h1>

        {/* Sub */}
        <p
          className="animate-fade-in stagger-3 font-body text-base sm:text-lg lg:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto mb-14"
        >
          Premium community merchandise designed for the TACSFON family.
          Quality that reflects who we are.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in stagger-4 flex items-center justify-center gap-4 flex-col sm:flex-row w-full sm:w-auto px-4">
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 font-body text-sm font-bold tracking-widest uppercase text-bg-base bg-accent px-8 py-4 sm:px-10 rounded-full hover:bg-accent-hover hover:scale-105 transition-all shadow-[0_8px_30px_rgba(61,186,111,0.3)] hover:shadow-[0_8px_40px_rgba(61,186,111,0.5)]"
          >
            Explore Store
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>

          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center font-body text-sm font-bold tracking-widest uppercase text-text-primary bg-bg-surface border border-border px-8 py-4 sm:px-10 rounded-full hover:border-accent hover:text-accent transition-colors"
          >
            Join Us
          </Link>
        </div>

        {/* Scroll indicator */}
        <div
          className="animate-fade-in stagger-5"
          aria-hidden="true"
          style={{
            marginTop:      '80px',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            '8px',
          }}
        >
          <span style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color:         'var(--text-muted)',
          }}>
            Scroll
          </span>
          <div style={{
            width:      '1px',
            height:     '40px',
            background: 'linear-gradient(to bottom, var(--accent), transparent)',
            animation:  'hero-scroll-pulse 2s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes hero-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(4%, 6%) scale(1.05); }
          66%       { transform: translate(-3%, 3%) scale(0.97); }
        }
        @keyframes hero-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-5%, -4%) scale(1.08); }
          70%       { transform: translate(3%, -6%) scale(0.95); }
        }
        @keyframes hero-grid-fade {
          from { opacity: 0.4; }
          to   { opacity: 1; }
        }
        @keyframes hero-scroll-pulse {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50%       { opacity: 0.4; transform: scaleY(0.7); }
        }
      `}</style>
    </section>
  )
}
