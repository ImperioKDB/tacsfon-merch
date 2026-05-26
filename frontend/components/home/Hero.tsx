'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Hero() {
  const { user } = useAuth();

  return (
    <div className="bg-black text-white py-32 px-6 text-center relative overflow-hidden">
      {/* Decorative BG element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.1),transparent_70%)] pointer-events-none" />
      
      <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase italic leading-none">
        Wear the <span className="text-gold">Mission</span>
      </h1>
      <p className="text-zinc-400 mb-12 max-w-lg mx-auto text-lg md:text-xl font-medium tracking-tight">
        Premium community merchandise designed for the TACSFON family.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
        <Link href="/products" className="bg-gold text-black px-12 py-4 font-black uppercase tracking-widest hover:bg-white transition-all transform hover:-translate-y-1">
          Explore Store
        </Link>
        
        {!user && (
          <Link href="/signup" className="border-2 border-white text-white px-12 py-4 font-black uppercase tracking-widest hover:bg-zinc-900 transition-all transform hover:-translate-y-1">
            Join Us
          </Link>
        )}
      </div>
    </div>
  );
}
