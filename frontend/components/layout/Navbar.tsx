
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth'; // Ensure this path matches your hook location
import { ShoppingCart, User, Menu, X, Bell } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-gold font-bold text-xl tracking-tighter">
            TACSFON <span className="text-white">MERCH</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/products" className="text-zinc-400 hover:text-gold transition">Products</Link>
            <Link href="/about" className="text-zinc-400 hover:text-gold transition">About</Link>
            <Link href="/contact" className="text-zinc-400 hover:text-gold transition">Contact</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Link href="/notifications" className="text-zinc-400 hover:text-gold"><Bell size={20}/></Link>
            <Link href="/cart" className="text-zinc-400 hover:text-gold relative">
              <ShoppingCart size={20}/>
            </Link>
            <Link href={user ? "/profile" : "/login"} className="text-zinc-400 hover:text-gold">
              <User size={20}/>
            </Link>
            
            {/* Mobile Toggle */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
              {isOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Fixes Image #2 */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-20 px-6 flex flex-col space-y-6 text-xl">
          <Link onClick={() => setIsOpen(false)} href="/products">Products</Link>
          <Link onClick={() => setIsOpen(false)} href="/about">About</Link>
          <Link onClick={() => setIsOpen(false)} href="/contact">Contact</Link>
          <hr className="border-zinc-800" />
          {user ? (
            <>
              <Link onClick={() => setIsOpen(false)} href="/profile">My Profile</Link>
              <button onClick={() => { signOut(); setIsOpen(false); }} className="text-red-500 text-left">Sign Out</button>
            </>
          ) : (
            <Link onClick={() => setIsOpen(false)} href="/login">Login / Sign Up</Link>
          )}
        </div>
      )}
    </nav>
  );
}
