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

  return (
    <nav className="bg-black border-b border-zinc-800 fixed top-0 w-full z-[100] h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-gold font-bold text-lg tracking-tighter uppercase">TACSFON <span className="text-white">MERCH</span></span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-zinc-400 relative p-2">
            <ShoppingCart size={20}/>
            {cartCount > 0 && <span className="absolute top-0 right-0 bg-gold text-black text-[9px] font-black px-1 rounded-full">{cartCount}</span>}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
             {isOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-16 bg-black z-[110] flex flex-col p-8 animate-fadeIn">
          <div className="flex flex-col space-y-4">
            <Link onClick={() => setIsOpen(false)} href="/products" className="text-2xl font-bold tracking-tight text-white border-b border-zinc-900 pb-4">STORE</Link>
            <Link onClick={() => setIsOpen(false)} href="/about" className="text-2xl font-bold tracking-tight text-white border-b border-zinc-900 pb-4">ABOUT</Link>
          </div>

          <div className="mt-auto pb-10 space-y-6">
            {!loading && user ? (
              <div className="space-y-4">
                {/* THIS IS THE GOLD BUTTON */}
                {isAdmin && (
                  <Link onClick={() => setIsOpen(false)} href="/admin" className="flex items-center gap-3 text-gold font-black text-sm tracking-widest border border-gold/30 p-4 bg-gold/5">
                    <LayoutDashboard size={18}/> ADMIN DASHBOARD
                  </Link>
                )}
                <Link onClick={() => setIsOpen(false)} href="/profile" className="flex items-center gap-3 text-white font-bold text-sm tracking-widest p-4">
                  <User size={18}/> MY ACCOUNT
                </Link>
                <button onClick={signOut} className="flex items-center gap-3 text-red-500 font-bold text-xs tracking-widest pt-4 pl-4">
                  <LogOut size={16}/> SIGN OUT
                </button>
              </div>
            ) : (
              <Link onClick={() => setIsOpen(false)} href="/login" className="text-gold font-bold text-lg tracking-widest py-4 block">SIGN IN / JOIN</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
