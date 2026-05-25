
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Hero() {
  const { user } = useAuth();

  return (
    <div className="bg-black text-white py-20 px-6 text-center">
      <h1 className="text-5xl font-bold mb-4">Premium TACSFON Merch</h1>
      <p className="text-zinc-400 mb-8 max-w-md mx-auto">Elevate your style with our exclusive collection.</p>
      
      <div className="flex justify-center gap-4">
        <Link href="/products" className="bg-gold text-black px-8 py-3 rounded-full font-bold">
          {user ? 'Go to Store' : 'Shop Now'}
        </Link>
        
        {!user && (
          <Link href="/signup" className="border border-white px-8 py-3 rounded-full font-bold">
            Sign Up
          </Link>
        )}
      </div>
    </div>
  );
}
