'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, User, Menu, X, Bell, LayoutDashboard, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const cartCount = useCartStore((state) => state.count);

  return (
    <nav className="bg-black border-b border-zinc-800 fixed top-0 w-full z-[100]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-gold font-bold text-lg tracking-tighter flex items-center gap-2">
          TACSFON <span className="text-white">MERCH</span>
          <div className="w-1.5 h-1.5 bg-gold rounded-full" />
        </Link>

        {/* Right Side Icons (Always Visible) */}
        <div className="flex items-center space-x-3 md:space-x-6">
          <Link href="/notifications" className="text-zinc-400 hover:text-gold transition-colors">
            <Bell size={20}/>
          </Link>
          
          <Link href="/cart" className="text-zinc-400 hover:text-gold relative transition-colors">
            <ShoppingCart size={20}/>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] font-bold px-1.5 rounded-full ring-2 ring-black">
                {cartCount}
              </span>
            )}
          </Link>

          <Link href={user ? "/profile" : "/login"} className="text-zinc-400 hover:text-gold transition-colors">
            <User size={20}/>
          </Link>
          
          <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
            {isOpen ? <X size={26}/> : <Menu size={26}/>}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 bg-black z-[110] flex flex-col p-8 space-y-8">
          <div className="space-y-4">
            <Link onClick={() => setIsOpen(false)} href="/products" className="block text-3xl font-bold uppercase tracking-tighter">Store</Link>
            <Link onClick={() => setIsOpen(false)} href="/about" className="block text-3xl font-bold uppercase tracking-tighter">About</Link>
            <Link onClick={() => setIsOpen(false)} href="/contact" className="block text-3xl font-bold uppercase tracking-tighter">Contact</Link>
          </div>

          <div className="pt-6 border-t border-zinc-800 space-y-6">
            {isAdmin && (
              <Link onClick={() => setIsOpen(false)} href="/admin" className="flex items-center gap-3 text-gold text-xl font-bold uppercase tracking-widest">
                <LayoutDashboard size={22}/> Admin Dashboard
              </Link>
            )}

            {user ? (
              <button onClick={signOut} className="flex items-center gap-3 text-red-500 text-xl font-bold uppercase tracking-widest">
                <LogOut size={22}/> Sign Out
              </button>
            ) : (
              <Link onClick={() => setIsOpen(false)} href="/login" className="block text-gold text-xl font-bold uppercase tracking-widest">
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
