import { AppSidebar } from '@/components/layout/app-sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex">
      <AppSidebar />
      <main className="flex-1 min-h-screen pb-20 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
