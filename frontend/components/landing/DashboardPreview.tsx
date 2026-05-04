'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const INITIAL_ORDERS = [
  { id: '1', orderId: 'STS-20260429-001', customer: 'Global Logics', status: 'In Transit', sla: '14:30', delayed: false },
  { id: '2', orderId: 'STS-20260429-002', customer: 'Apex Corp', status: 'Picked', sla: '15:45', delayed: false },
  { id: '3', orderId: 'STS-20260429-003', customer: 'Swift Mart', status: 'Delivered', sla: '12:00', delayed: false },
  { id: '4', orderId: 'STS-20260429-004', customer: 'Horizon Ltd', status: 'Created', sla: '16:15', delayed: false },
];

const STATUSES = ['Created', 'Picked', 'In Transit', 'Delivered'];

export default function DashboardPreview() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * next.length);
        const order = { ...next[randomIndex] };

        // Move status forward if not delivered
        if (order.status !== 'Delivered') {
          const currentIdx = STATUSES.indexOf(order.status);
          order.status = STATUSES[currentIdx + 1];
        } else {
          // Reset if delivered
          order.status = 'Created';
          order.delayed = false;
        }

        // Randomly set delay
        if (order.status === 'In Transit' && Math.random() > 0.7) {
          order.delayed = true;
          setHighlightedId(order.id);
          setTimeout(() => setHighlightedId(null), 3000);
        }

        next[randomIndex] = order;
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Decorative background glow */}
      <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl rounded-3xl -z-10" />
      
      <div className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/5 bg-white/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <span className="text-xs font-medium text-white/40 ml-2">Live Operations Overview</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle size={12} />
              <span>98.2% SLA</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors duration-500 ${
                order.delayed 
                  ? 'bg-red-500/10 border-red-500/20' 
                  : highlightedId === order.id 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' : 
                  order.delayed ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {order.status === 'Delivered' ? <CheckCircle size={16} /> : 
                   order.status === 'In Transit' ? <Truck size={16} /> : 
                   order.status === 'Picked' ? <Package size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{order.orderId}</div>
                  <div className="text-[10px] text-white/40">{order.customer}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-0.5">SLA</div>
                  <div className={`text-xs font-mono ${order.delayed ? 'text-red-400 font-bold' : 'text-white/80'}`}>
                    {order.sla}
                  </div>
                </div>

                <div className="w-24">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={order.status + (order.delayed ? '-delayed' : '')}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full text-center ${
                        order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.delayed ? 'bg-red-500/20 text-red-400 animate-pulse' :
                        order.status === 'In Transit' ? 'bg-indigo-500/20 text-indigo-400' :
                        'bg-white/10 text-white/60'
                      }`}
                    >
                      {order.delayed ? 'SLA BREACH' : order.status.toUpperCase()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer / Status Bar */}
        <div className="bg-white/5 border-t border-white/5 p-3 px-5 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-white/40">On Track</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-white/40">Delayed</span>
            </div>
          </div>
          <div className="text-[10px] text-white/20 italic">Updating in real-time...</div>
        </div>
      </div>
    </div>
  );
}
