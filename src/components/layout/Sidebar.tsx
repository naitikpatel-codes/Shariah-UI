import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, FileText, Lock,
  Settings, HelpCircle, LogOut
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'New Analysis', icon: PlusCircle, path: '/new-analysis' },
  { label: 'Reports', icon: FileText, path: '/reports' },
  { label: 'Open Encrypted', icon: Lock, path: '/open-encrypted' },
];

const generalItems = [
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Help', icon: HelpCircle, path: '/help' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/login');
  };

  // Derive user display info from Supabase user object
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const role = user?.user_metadata?.role || 'Compliance Analyst';

  return (
    <aside
      className={cn(
        "fixed left-0 top-[60px] bottom-0 z-40 flex flex-col bg-surface border-r border-border transition-all duration-300 ease-out",
        sidebarOpen ? "w-[240px]" : "w-[64px]"
      )}
    >
      {/* Brand Zone */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-border overflow-hidden">
        {sidebarOpen ? (
          <img
            src="/fortiv-logo.jpg"
            alt="Fortiv Solutions"
            className="h-10 object-contain"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1783DF] to-[#074D9E] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-display font-bold text-lg">F</span>
          </div>
        )}
      </div>

      {/* Menu Section */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
        <div className="px-4 mb-2">
          {sidebarOpen && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Menu
            </span>
          )}
        </div>
        <div className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/reports' && location.pathname.startsWith('/report/'));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2.5 px-3 py-2 rounded-r-md mr-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent text-brand before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:bg-brand before:rounded-r-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.75} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className="px-4 mt-6 mb-2">
          {sidebarOpen && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              General
            </span>
          )}
        </div>
        <div className="space-y-1 px-2">
          {generalItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2.5 px-3 py-2 rounded-r-md mr-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent text-brand"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.75} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
          <button
            onClick={handleLogout}
            className="relative flex items-center gap-2.5 px-3 py-2 rounded-r-md mr-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 w-full"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.75} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </nav>

      {/* User Card */}
      {sidebarOpen && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
              <p className="text-xs text-gray-500 truncate">{role}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-compliant" />
            <span className="text-xs text-gray-500">License: <span className="font-semibold text-compliant">ACTIVE</span></span>
          </div>
        </div>
      )}
    </aside>
  );
}
