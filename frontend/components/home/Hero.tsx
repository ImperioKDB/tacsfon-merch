'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Hero() {
  const { user, loading } = useAuth();

  return (
    <div className="bg-black text-white py-24 px-6 text-center border-b border-zinc-900">
      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
        WEAR THE <span className="text-gold">MISSION</span>
      </h1>
      <p className="text-zinc-400 mb-10 max-w-lg mx-auto text-lg">
        Premium community merchandise for the TACSFON family.
      </p>
      
      {!loading && (
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/products" className="bg-gold text-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-white transition-colors">
            {user ? 'Explore Store' : 'Shop Now'}
          </Link>
          
          {!user && (
            <Link href="/signup" className="border border-zinc-700 text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-zinc-900 transition-colors">
              Join Us
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
