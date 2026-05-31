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
          <span className="text-gold font-black text-lg tracking-tighter uppercase italic">TACSFON <span className="text-white">MERCH</span></span>
        </Link>

        {/* DESKTOP LINKS - Visible on large screens */}
        <div className="hidden md:flex items-center gap-8">
           <Link href="/products" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Store</Link>
           <Link href="/about" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">About</Link>
           {isAdmin && <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-white transition-colors">Admin Panel</Link>}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-zinc-400 relative p-2">
            <ShoppingCart size={20}/>
            {cartCount > 0 && <span className="absolute top-0 right-0 bg-gold text-black text-[9px] font-black px-1 rounded-full">{cartCount}</span>}
          </Link>
          
          <div className="hidden md:block">
            {user ? (
               <Link href="/profile" className="text-zinc-400 p-2"><User size={20}/></Link>
            ) : (
               <Link href="/login" className="bg-gold text-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">Sign In</Link>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 md:hidden">
             {isOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
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
                  <Link onClick={() => setIsOpen(false)} href="/admin" className="flex items-center gap-3 text-gold font-black text-sm p-4 bg-zinc-900 border border-gold/20">
                    <LayoutDashboard size={18}/> ADMIN PANEL
                  </Link>
                )}
                <Link onClick={() => setIsOpen(false)} href="/profile" className="flex items-center gap-3 text-white font-black text-sm p-4 bg-zinc-900">
                  <User size={18}/> MY PROFILE
                </Link>
                <button onClick={() => { setIsOpen(false); signOut(); }} className="w-full flex items-center gap-3 text-red-500 font-black text-xs p-4 uppercase">
                  <LogOut size={16}/> Sign Out
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
