import './globals.css';
import { ToastProvider } from '@/components/ui/Toast.jsx';

export const metadata = {
  title: 'The Tox Technique — Influencer Outreach Platform',
  description: 'Internal operations, multi-account Instagram outreach logging, repeat detection, and influencer intelligence.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0d0e12] text-zinc-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
