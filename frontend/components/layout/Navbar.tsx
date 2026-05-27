'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, User, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const cartCount = useCartStore((state) => state.count);

  return (
    <nav className="bg-black border-b border-zinc-800 fixed top-0 w-full z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link href="/" className="text-gold font-bold text-xl tracking-tighter flex items-center gap-2">
          TACSFON <span className="text-white">MERCH</span>
          <div className="w-1.5 h-1.5 bg-gold rounded-full" />
        </Link>

        <div className="flex items-center space-x-5">
          {/* Desktop Dashboard Link */}
          {isAdmin && (
            <Link href="/admin" className="hidden md:flex items-center gap-2 text-gold border border-gold/30 px-3 py-1 text-xs font-bold">
              <LayoutDashboard size={14}/> DASHBOARD
            </Link>
          )}
          
          <Link href="/cart" className="text-zinc-400 hover:text-gold relative transition-colors">
            <ShoppingCart size={22}/>
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] font-bold px-1.5 rounded-full ring-2 ring-black">{cartCount}</span>}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-gold transition-colors">
            {isOpen ? <X size={28}/> : <Menu size={28}/>}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-20 bg-black z-[110] flex flex-col p-10 space-y-8 animate-fadeIn md:hidden">
          <div className="space-y-6">
            <Link onClick={() => setIsOpen(false)} href="/products" className="block text-4xl font-bold">STORE</Link>
            <Link onClick={() => setIsOpen(false)} href="/about" className="block text-4xl font-bold">ABOUT</Link>
            <Link onClick={() => setIsOpen(false)} href="/contact" className="block text-4xl font-bold">CONTACT</Link>
          </div>

          <div className="pt-10 border-t border-zinc-900 space-y-6">
            {/* Mobile Admin Dashboard Link */}
            {isAdmin && (
              <Link onClick={() => setIsOpen(false)} href="/admin" className="flex items-center gap-3 text-gold text-xl font-black italic tracking-widest border border-gold/20 p-4">
                <LayoutDashboard size={20}/> ADMIN DASHBOARD
              </Link>
            )}

            {user ? (
              <>
                <Link onClick={() => setIsOpen(false)} href="/profile" className="flex items-center gap-3 text-white text-xl font-bold"><User size={20}/> MY ACCOUNT</Link>
                <button onClick={signOut} className="flex items-center gap-3 text-red-500 text-xl font-bold pt-4"><LogOut size={20}/> SIGN OUT</button>
              </>
            ) : (
              <Link onClick={() => setIsOpen(false)} href="/login" className="block text-gold text-xl font-bold uppercase tracking-widest">Login / Sign Up</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
