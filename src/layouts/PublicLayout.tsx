import { Outlet } from 'react-router-dom';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import WhatsAppButton from '@/components/public/WhatsAppButton';

export default function PublicLayout() {
  return (
    <div className="min-h-screen antialiased flex flex-col">
      <Navbar />
      <main className="flex-grow min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
