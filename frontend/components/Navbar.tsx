'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
            <Truck size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-none">ShipTrack</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Logistics SaaS</p>
          </div>
        </Link>

        {/* Auth Links */}
        <div className="flex items-center gap-6">
          <Link 
            href="/login" 
            className="text-sm font-medium text-white/60 hover:text-white flex items-center gap-2 transition-colors"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </Link>
          
          <Link 
            href="/signup" 
            className="hidden sm:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
          >
            <UserPlus size={16} />
            <span>Get Started</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
