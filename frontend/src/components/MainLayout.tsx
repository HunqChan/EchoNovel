import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LogOut,
  Menu,
  X,
  UserCircle,
  ShieldCheck,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function MainLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text-primary">
      {/* ───── Navbar ───── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EchoNovel
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              to="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              Trang chủ
            </Link>
            <Link
              to="/stories"
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              Kho truyện
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Quản trị
                  </Link>
                )}

                {/* User profile link */}
                <Link to="/profile" className="ml-2 flex items-center gap-3 rounded-lg border border-white/10 bg-surface-light px-3 py-1.5 transition-colors hover:bg-white/5">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <UserCircle className="h-5 w-5 text-primary" />
                  )}
                  <span className="text-sm font-medium">{user?.username}</span>
                  {user?.isVip && (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                      VIP
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
                >
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  <UserPlus className="h-4 w-4" />
                  Đăng ký
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-surface-light px-4 pb-4 pt-2 md:hidden">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5"
            >
              Trang chủ
            </Link>
            <Link
              to="/stories"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5"
            >
              Kho truyện
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="my-2 flex items-center gap-2 rounded-lg border border-white/10 bg-surface px-3 py-2 transition-colors hover:bg-white/5">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <UserCircle className="h-5 w-5 text-primary" />
                  )}
                  <span className="text-sm font-medium">{user?.username}</span>
                  {user?.isVip && (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                      VIP
                    </span>
                  )}
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Quản trị
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5"
                >
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  <UserPlus className="h-4 w-4" />
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ───── Content ───── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ───── Footer ───── */}
      <footer className="border-t border-white/10 bg-surface py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-text-secondary">
          © 2026 EchoNovel — Đọc &amp; Nghe Truyện Online
        </div>
      </footer>
    </div>
  );
}
