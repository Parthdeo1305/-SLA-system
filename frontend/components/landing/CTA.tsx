'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto rounded-[2rem] bg-gradient-to-br from-indigo-600 to-blue-700 p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-600/20"
        >
          {/* Decorative Sparkles */}
          <div className="absolute top-10 left-10 text-white/20 animate-pulse">
            <Sparkles size={40} />
          </div>
          <div className="absolute bottom-10 right-10 text-white/20 animate-pulse" style={{ animationDelay: '1s' }}>
            <Sparkles size={32} />
          </div>

          <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-8 leading-tight">
            Ready to Take Control <br className="hidden sm:block" /> 
            of Your Logistics?
          </h2>
          
          <p className="text-white/80 text-lg lg:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Join 500+ operations teams who use ShipTrack to monitor their fleet 
            and deliver on their promises every single day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Link href="/signup" className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-white/90 transition-all shadow-xl shadow-black/10">
                <span>Get Started Now</span>
                <ArrowRight size={20} strokeWidth={3} />
              </Link>
            </motion.div>
            
            <Link href="/login" className="text-white font-bold text-lg hover:text-white/80 transition-colors border-b-2 border-white/20 pb-1">
              Talk to an Expert
            </Link>
          </div>

          <p className="mt-12 text-white/40 text-sm font-medium uppercase tracking-widest">
            No credit card required • 14-day free trial
          </p>
        </motion.div>
      </div>
    </section>
  );
}
