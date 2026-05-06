'use client';

import { motion } from 'framer-motion';
import { MousePointer2, FileEdit, LineChart } from 'lucide-react';

const STEPS = [
  {
    title: 'Ingest Orders',
    description: 'Bulk upload via CSV or connect your ERP. Set promised delivery times for automated SLA tracking.',
    icon: FileEdit,
    step: '01'
  },
  {
    title: 'Monitor Operations',
    description: 'Warehouse staff update statuses in real-time. Our engine instantly updates the dashboard across all roles.',
    icon: MousePointer2,
    step: '02'
  },
  {
    title: 'Eliminate Delays',
    description: 'Predictive warnings highlight shipments at risk. Resolve exceptions before they turn into breaches.',
    icon: LineChart,
    step: '03'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[var(--color-bg)] border-y border-[var(--color-border)]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-6"
          >
            Streamlined <br /> 
            <span className="text-[var(--color-text-primary)]/40">From Order to Delivery.</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -translate-y-1/2" />

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                className="relative bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-3xl p-10 flex flex-col items-center text-center group"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#111118] border border-[var(--color-border)] flex items-center justify-center text-indigo-400 font-bold text-sm z-10 group-hover:border-indigo-500/50 transition-colors">
                  {step.step}
                </div>
                
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <step.icon size={32} />
                </div>
                
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">{step.title}</h3>
                <p className="text-[var(--color-text-primary)]/60 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow (Desktop) */}
                {idx < 2 && (
                  <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center text-[var(--color-text-primary)]/10 z-20">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                      </svg>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
