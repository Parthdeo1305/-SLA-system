'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import BusinessValue from '@/components/landing/BusinessValue';
import CTA from '@/components/landing/CTA';

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || (isAuthenticated && !loading)) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] selection:bg-indigo-500/30">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <BusinessValue />
        <CTA />
      </main>
      
      {/* Simple Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-40 grayscale">
            <div className="w-6 h-6 rounded bg-white" />
            <span className="font-bold text-white text-sm">ShipTrack</span>
          </div>
          <div className="flex gap-8 text-white/40 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          <p className="text-white/20 text-xs">
            © 2026 ShipTrack Logistics SaaS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
