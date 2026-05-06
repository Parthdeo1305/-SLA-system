'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, LogIn, UserPlus, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
          ? 'bg-[var(--color-bg-transparent)] backdrop-blur-md border-b border-[var(--color-border)] py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
            <Truck size={18} className="text-[var(--color-text-primary)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--color-text-primary)] text-lg leading-none">ShipTrack</p>
            <p className="text-[10px] text-[var(--color-brand-text)] font-bold uppercase tracking-wider">Logistics SaaS</p>
          </div>
        </Link>

        {/* Auth Links */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link 
            href="/login" 
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-2 transition-colors"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </Link>
          
          <Link 
            href="/signup" 
            className="hidden sm:flex items-center gap-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--color-border)]"
          >
            <UserPlus size={16} />
            <span>Get Started</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
