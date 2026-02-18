import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export function AppShell() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Sidebar />
      <main
        className={cn(
          "pt-[60px] transition-all duration-300 ease-out",
          sidebarOpen ? "ml-[240px]" : "ml-[64px]"
        )}
      >
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
