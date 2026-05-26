'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, User, Menu, X, Bell, LayoutDashboard } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  const cartCount = useCartStore((state) => state.count);

  return (
    <nav className="bg-black border-b border-zinc-800 fixed top-0 w-full z-[100]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-gold font-bold text-lg tracking-tighter">
          TACSFON <span className="text-white">MERCH</span>
        </Link>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Link href="/admin" className="hidden md:flex items-center gap-2 text-gold border border-gold/30 px-3 py-1 text-xs font-bold uppercase">
              <LayoutDashboard size={14}/> Dashboard
            </Link>
          )}
          <Link href="/cart" className="text-zinc-400 relative">
            <ShoppingCart size={20}/>
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] px-1.5 rounded-full">{cartCount}</span>}
          </Link>
          <Link href={user ? "/profile" : "/login"} className="text-zinc-400">
            <User size={20}/>
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white"><Menu size={24}/></button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-0 bg-black z-[110] flex flex-col p-8 space-y-8 md:hidden">
          <div className="flex justify-between items-center mb-4">
             <span className="text-gold font-bold">MENU</span>
             <button onClick={() => setIsOpen(false)}><X size={28} className="text-white"/></button>
          </div>
          <Link onClick={() => setIsOpen(false)} href="/products" className="text-2xl font-bold">Store</Link>
          
          {isAdmin && (
            <Link onClick={() => setIsOpen(false)} href="/admin" className="text-2xl font-bold text-gold flex items-center gap-2">
              <LayoutDashboard /> Admin Dashboard
            </Link>
          )}

          <Link onClick={() => setIsOpen(false)} href="/profile" className="text-2xl font-bold">My Account</Link>
        </div>
      )}
    </nav>
  );
}
