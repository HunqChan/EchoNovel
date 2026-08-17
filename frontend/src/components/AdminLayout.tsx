import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Library,
  LogOut,
  Tags,
  UserCircle,
  Users,
  PenTool,
  Crown
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/stories', label: 'Truyện & Chương', icon: Library },
  { to: '/admin/genres', label: 'Thể loại', icon: Tags },
  { to: '/admin/authors', label: 'Tác giả', icon: PenTool },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/vip-packages', label: 'Gói VIP', icon: Crown },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface text-text-primary">
      {/* ───── Sidebar ───── */}
      <aside
        className={`flex flex-col border-r border-white/10 bg-surface-light transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2 text-lg font-bold">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EchoNovel
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-white/5 ${
              collapsed ? 'mx-auto' : ''
            }`}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {sidebarLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-white/10 p-3">
          <div
            className={`flex items-center gap-3 rounded-lg bg-surface px-3 py-2 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <UserCircle className="h-5 w-5 shrink-0 text-primary" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user?.username}</p>
                <p className="truncate text-xs text-text-secondary">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Đăng xuất' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* ───── Main Content ───── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-surface px-6">
          <h1 className="text-lg font-semibold">
            {sidebarLinks.find((l) => l.to === location.pathname)?.label || 'Admin Panel'}
          </h1>
          <Link
            to="/"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            ← Về trang chủ
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
