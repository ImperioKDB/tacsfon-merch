'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, User, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut, loading } = useAuth();
  const cartCount = useCartStore((s) => s.count);

  const handleSignOutAction = () => {
    setIsOpen(false);
    signOut();
  };

  return (
    <nav className="bg-black border-b border-zinc-800 fixed top-0 w-full z-[100] h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <span className="text-gold font-bold text-lg tracking-tighter uppercase italic">TACSFON <span className="text-white">MERCH</span></span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-zinc-400 relative p-2" onClick={() => setIsOpen(false)}>
            <ShoppingCart size={20}/>
            {cartCount > 0 && <span className="absolute top-0 right-0 bg-gold text-black text-[9px] font-black px-1 rounded-full">{cartCount}</span>}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
             {isOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-16 bg-black z-[110] flex flex-col p-8 animate-fadeIn md:hidden">
          <div className="flex flex-col space-y-6">
            <Link onClick={() => setIsOpen(false)} href="/products" className="text-3xl font-black italic tracking-tighter text-white border-b border-zinc-900 pb-4">STORE</Link>
            <Link onClick={() => setIsOpen(false)} href="/about" className="text-3xl font-black italic tracking-tighter text-white border-b border-zinc-900 pb-4">ABOUT</Link>
          </div>

          <div className="mt-auto pb-10 space-y-4">
            {!loading && user ? (
              <>
                {isAdmin && (
                  <Link onClick={() => setIsOpen(false)} href="/admin" className="flex items-center gap-3 text-gold font-black text-sm tracking-widest border border-gold/20 p-4 bg-gold/5">
                    <LayoutDashboard size={18}/> ADMIN DASHBOARD
                  </Link>
                )}
                <Link onClick={() => setIsOpen(false)} href="/profile" className="flex items-center gap-3 text-white font-black text-sm tracking-widest p-4 bg-zinc-900">
                  <User size={18}/> MY PROFILE
                </Link>
                <button onClick={handleSignOutAction} className="w-full flex items-center gap-3 text-red-500 font-black text-xs tracking-widest p-4 uppercase">
                  <LogOut size={16}/> Instant Sign Out
                </button>
              </>
            ) : (
              <Link onClick={() => setIsOpen(false)} href="/login" className="text-gold font-black text-2xl tracking-widest py-4 block">SIGN IN</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
