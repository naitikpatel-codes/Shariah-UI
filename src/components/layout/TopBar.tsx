import { Search, Bell, Menu } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

export function TopBar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-surface border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-5 h-5" strokeWidth={1.75} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search..."
            className="w-80 h-9 pl-10 pr-4 rounded-full bg-gray-100 border-none text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-shadow"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">⌘F</kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5" strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-noncompliant" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-primary-foreground text-xs font-semibold">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{fullName.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
}
