import { AppSidebar } from '@/components/layout/app-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-atlas-bg-subtle flex">
      <AppSidebar />
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}
