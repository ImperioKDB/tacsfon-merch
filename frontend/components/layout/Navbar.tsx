'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, User, Menu, X, LayoutDashboard, LogOut, Bell } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const cartCount = useCartStore((s) => s.count);

  return (
    <nav className="bg-black border-b border-zinc-800 fixed top-0 w-full z-[100] h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-3">
          <span className="text-gold font-bold text-xl tracking-tighter uppercase group-hover:text-white transition-colors">TACSFON <span className="text-white group-hover:text-gold">MERCH</span></span>
          <div className="w-2 h-2 bg-gold animate-pulse" />
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/notifications" className="text-zinc-400 hover:text-gold p-2"><Bell size={22}/></Link>
          <Link href="/cart" className="text-zinc-400 hover:text-gold relative p-2">
            <ShoppingCart size={22}/>
            {cartCount > 0 && <span className="absolute top-0 right-0 bg-gold text-black text-[10px] font-black px-1.5 rounded-full">{cartCount}</span>}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-gold p-2">
             <Menu size={28}/>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black z-[110] flex flex-col p-12 space-y-12 animate-fadeIn md:hidden">
          <div className="flex justify-between items-center">
            <span className="text-zinc-600 font-bold tracking-[0.3em] text-xs">NAVIGATION</span>
            <button onClick={() => setIsOpen(false)}><X size={32} className="text-white hover:text-gold"/></button>
          </div>
          
          <div className="flex flex-col space-y-6">
            <Link onClick={() => setIsOpen(false)} href="/products" className="text-5xl font-black italic tracking-tighter hover:text-gold transition-all">STORE</Link>
            <Link onClick={() => setIsOpen(false)} href="/about" className="text-5xl font-black italic tracking-tighter hover:text-gold transition-all">ABOUT</Link>
          </div>

          <div className="pt-12 border-t border-zinc-900 space-y-8">
            {isAdmin && (
              <Link onClick={() => setIsOpen(false)} href="/admin" className="flex items-center gap-4 text-gold text-2xl font-bold tracking-widest border-l-4 border-gold pl-4">
                <LayoutDashboard size={24}/> ADMIN PANEL
              </Link>
            )}
            {user ? (
              <div className="space-y-6">
                <Link onClick={() => setIsOpen(false)} href="/profile" className="flex items-center gap-4 text-white text-2xl font-bold tracking-widest"><User size={24}/> MY PROFILE</Link>
                <button onClick={signOut} className="flex items-center gap-4 text-red-500 text-sm font-bold tracking-[0.2em] pt-4"><LogOut size={18}/> TERMINATE SESSION</button>
              </div>
            ) : (
              <Link onClick={() => setIsOpen(false)} href="/login" className="text-gold text-2xl font-bold tracking-widest underline underline-offset-8">SIGN IN / JOIN</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
