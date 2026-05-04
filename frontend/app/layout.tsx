import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | ShipTrack',
    default: 'ShipTrack — Logistics Management Platform',
  },
  description:
    'Real-time shipment tracking and SLA breach detection for logistics operations teams.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
