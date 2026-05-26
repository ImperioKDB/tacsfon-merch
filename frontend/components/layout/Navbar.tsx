'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, User, Menu, X, Bell } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const cartCount = useCartStore((state) => state.count);

  // Close mobile menu when user changes
  useEffect(() => {
    setIsOpen(false);
  }, [user]);

  return (
    <nav className="bg-black border-b border-zinc-800 fixed top-0 w-full z-[100]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-gold font-bold text-lg tracking-tighter flex-shrink-0">
          TACSFON <span className="text-white">MERCH</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-6">
          <Link href="/products" className="text-zinc-400 hover:text-gold text-sm uppercase tracking-widest transition-colors">Products</Link>
          <Link href="/about" className="text-zinc-400 hover:text-gold text-sm uppercase tracking-widest transition-colors">About</Link>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link href="/notifications" className="text-zinc-400 hover:text-white transition-colors"><Bell size={20}/></Link>
          <Link href="/cart" className="text-zinc-400 hover:text-white relative transition-colors">
            <ShoppingCart size={20}/>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] font-bold px-1.5 rounded-full ring-2 ring-black">
                {cartCount}
              </span>
            )}
          </Link>
          
          {/* Profile Icon: Only show if not loading */}
          {!loading && (
            <Link href={user ? "/profile" : "/login"} className="text-zinc-400 hover:text-white transition-colors">
              <User size={20}/>
            </Link>
          )}
          
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-1" aria-label="Toggle Menu">
            {isOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 bg-black z-[110] flex flex-col p-8 space-y-8 md:hidden">
          <Link onClick={() => setIsOpen(false)} href="/products" className="text-2xl font-bold text-white">Products</Link>
          <Link onClick={() => setIsOpen(false)} href="/about" className="text-2xl font-bold text-white">About</Link>
          <Link onClick={() => setIsOpen(false)} href="/contact" className="text-2xl font-bold text-white">Contact</Link>
          
          <div className="pt-6 border-t border-zinc-800">
            {loading ? (
               <div className="h-8 w-24 bg-zinc-800 animate-pulse" />
            ) : user ? (
              <div className="flex flex-col space-y-6">
                <Link onClick={() => setIsOpen(false)} href="/profile" className="text-white text-xl font-bold uppercase tracking-widest">My Profile</Link>
                <button onClick={() => { signOut(); setIsOpen(false); }} className="text-red-500 font-bold text-xl uppercase tracking-widest text-left">Sign Out</button>
              </div>
            ) : (
              <Link onClick={() => setIsOpen(false)} href="/login" className="text-gold font-bold text-xl uppercase tracking-widest">Login / Sign Up</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
