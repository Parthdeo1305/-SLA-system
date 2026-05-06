'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, BarChart3, Users, Globe, Bell } from 'lucide-react';

const FEATURES = [
  {
    title: 'Real-time SLA Monitoring',
    description: 'Our proprietary engine computes SLA status on the fly. No cron jobs, no delays—just pure real-time data.',
    icon: Zap,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10'
  },
  {
    title: 'Automated Breach Alerts',
    description: 'Get notified the exact millisecond a shipment crosses its promised delivery time. Reduce penalty exposure.',
    icon: Bell,
    color: 'text-red-400',
    bg: 'bg-red-400/10'
  },
  {
    title: 'Operations Intelligence',
    description: 'Advanced analytics that identify bottlenecks in your pickup and transit flows before they impact customers.',
    icon: BarChart3,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    title: 'Enterprise Security',
    description: 'Role-based access control (RBAC), JWT authentication, and encrypted data at rest protect your shipment data.',
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
  {
    title: 'Multi-Role Collaboration',
    description: 'Dedicated interfaces for Operations Managers, Warehouse Staff, and Admins to ensure seamless workflow.',
    icon: Users,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  {
    title: 'Global Fleet Tracking',
    description: 'Track shipments across regions and timezones with built-in UTC normalization and local time rendering.',
    icon: Globe,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10'
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-[var(--color-bg)] relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-6"
          >
            Built for High-Velocity <br /> 
            <span className="text-[var(--color-text-primary)]/40">Logistics Teams.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--color-text-primary)]/60 leading-relaxed"
          >
            We've stripped away the complexity of traditional WMS systems to focus 
            on what matters: getting shipments to customers on time, every time.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">{feature.title}</h3>
              <p className="text-[var(--color-text-primary)]/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
