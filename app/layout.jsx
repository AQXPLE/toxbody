import './globals.css';
import { ToastProvider } from '@/components/ui/Toast.jsx';

export const metadata = {
  title: 'The Tox Technique — Influencer Outreach Platform',
  description: 'Internal operations, multi-account Instagram outreach logging, repeat detection, and influencer intelligence.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-[#ededed] antialiased selection:bg-[#ff5500]/30 selection:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
