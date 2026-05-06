'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, ShieldAlert, BadgeCheck } from 'lucide-react';

const METRICS = [
  {
    label: 'On-Time Delivery',
    value: '+40%',
    description: 'Increase in delivery reliability within the first 3 months of implementation.',
    icon: Clock,
    color: 'text-[var(--badge-delivered-text)]'
  },
  {
    label: 'OpEx Savings',
    value: '22%',
    description: 'Average reduction in operational costs by eliminating manual tracking calls.',
    icon: TrendingUp,
    color: 'text-[var(--color-brand-text)]'
  },
  {
    label: 'Penalty Reduction',
    value: '85%',
    description: 'Drastic drop in SLA breach penalties through proactive exception management.',
    icon: ShieldAlert,
    color: 'text-[var(--color-danger-text)]'
  }
];

export default function BusinessValue() {
  return (
    <section className="py-24 bg-[var(--color-bg)]">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-[var(--color-brand-text)] font-bold uppercase tracking-widest text-xs mb-6"
            >
              <BadgeCheck size={16} />
              <span>Proven ROI</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-8 leading-tight"
            >
              Logistics Performance <br /> 
              <span className="text-[var(--color-text-primary)]/40">Powered by Intelligence.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[var(--color-text-primary)]/60 leading-relaxed mb-8"
            >
              We don't just track boxes. We provide the operational clarity needed 
              to turn logistics from a cost center into a competitive advantage. 
              Our platform helps you deliver on your promises at scale.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="grid gap-4"
            >
              {['Proprietary SLA computation engine', 'Zero-latency data synchronization', 'Audit-ready compliance reporting'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[var(--color-text-primary)]/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="grid gap-6">
            {METRICS.map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-start gap-6 group hover:bg-[var(--color-surface-hover)] transition-all"
              >
                <div className={`p-4 rounded-2xl bg-[var(--color-surface-hover)] ${metric.color} group-hover:scale-110 transition-transform`}>
                  <metric.icon size={24} />
                </div>
                <div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-black text-[var(--color-text-primary)]">{metric.value}</span>
                    <span className="text-sm font-bold text-[var(--color-text-primary)]/40 uppercase tracking-wider">{metric.label}</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-primary)]/60 leading-relaxed">
                    {metric.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
