'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import DashboardPreview from './DashboardPreview';

export default function Hero() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-2xl"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-brand-text)] text-xs font-bold uppercase tracking-widest mb-6">
            <Zap size={12} className="fill-current" />
            <span>Next-Gen Logistics Engine</span>
          </motion.div>
          
          <motion.h1 variants={item} className="text-5xl lg:text-7xl font-extrabold text-[var(--color-text-primary)] leading-tight mb-6">
            Real-Time Visibility <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              Zero SLA Breaches.
            </span>
          </motion.h1>
          
          <motion.p variants={item} className="text-lg text-[var(--color-text-secondary)] mb-10 leading-relaxed max-w-lg">
            Stop reacting to delays. ShipTrack empowers operations teams with predictive tracking, 
            instant breach detection, and an intelligent dashboard designed for mission-critical logistics.
          </motion.p>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-indigo-600 text-[var(--color-text-primary)] px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20">
              <span>Start Free Trial</span>
              <ArrowRight size={18} />
            </Link>
            
            <Link href="/login" className="w-full sm:w-auto bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-surface-hover)] transition-all hover:scale-105 active:scale-95">
              <span>Book a Demo</span>
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-12 flex items-center gap-8 border-t border-[var(--color-border)] pt-12">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">500+</span>
              <span className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Fleet Partners</span>
            </div>
            <div className="w-px h-10 bg-[var(--color-surface-hover)]" />
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">99.9%</span>
              <span className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Uptime SLA</span>
            </div>
            <div className="w-px h-10 bg-[var(--color-surface-hover)]" />
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
              <ShieldCheck size={24} className="text-emerald-500" />
              <span className="text-xs font-medium leading-tight">ISO 27001 <br /> Certified</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Animated Dashboard Preview */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <DashboardPreview />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
