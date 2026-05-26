'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, User, Menu, X, Bell } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const cartCount = useCartStore((state) => state.count);

  return (
    <nav className="bg-black border-b border-zinc-800 fixed top-0 w-full z-[100]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-gold font-bold text-lg tracking-tighter">
          TACSFON <span className="text-white">MERCH</span>
        </Link>

        <div className="hidden md:flex space-x-6 uppercase text-xs tracking-widest">
          <Link href="/products" className="text-zinc-400 hover:text-gold">Products</Link>
          <Link href="/about" className="text-zinc-400 hover:text-gold">About</Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/notifications" className="text-zinc-400"><Bell size={20}/></Link>
          <Link href="/cart" className="text-zinc-400 relative">
            <ShoppingCart size={20}/>
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] px-1.5 rounded-full">{cartCount}</span>}
          </Link>
          
          <Link href={user ? "/profile" : "/login"} className="text-zinc-400">
            <User size={20}/>
          </Link>
          
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
            {isOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-16 bg-black z-[110] flex flex-col p-8 space-y-8 md:hidden">
          <Link onClick={() => setIsOpen(false)} href="/products" className="text-2xl font-bold">Products</Link>
          <Link onClick={() => setIsOpen(false)} href="/about" className="text-2xl font-bold">About</Link>
          <Link onClick={() => setIsOpen(false)} href="/contact" className="text-2xl font-bold">Contact</Link>
          
          <div className="pt-6 border-t border-zinc-800">
            {user ? (
              <div className="flex flex-col space-y-6">
                <Link onClick={() => setIsOpen(false)} href="/profile" className="text-white text-xl font-bold uppercase">My Profile</Link>
                <button onClick={() => { signOut(); setIsOpen(false); }} className="text-red-500 font-bold text-xl uppercase text-left">Sign Out</button>
              </div>
            ) : (
              <Link onClick={() => setIsOpen(false)} href="/login" className="text-gold font-bold text-xl uppercase">Login / Sign Up</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
