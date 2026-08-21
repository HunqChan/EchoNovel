import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { BookOpen, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      const { token, refreshToken, user } = response.data;

      login(token, refreshToken, user);
      toast.success(`Xin chào, ${user.username}!`);

      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-surface-light to-surface px-4 py-12">
      {/* Glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-surface-light/80 p-8 shadow-2xl backdrop-blur-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link to="/" className="mb-4 inline-flex items-center gap-2 text-2xl font-bold">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EchoNovel
              </span>
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-text-primary">Đăng nhập</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Chào mừng bạn quay trở lại!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 pr-12 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-2 flex justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-secondary transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-surface-light px-2 text-text-secondary">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center overflow-hidden rounded-xl">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    try {
                      setLoading(true);
                      const response = await authService.googleLogin({ token: credentialResponse.credential });
                      const { token, refreshToken, user } = response.data;
                      login(token, refreshToken, user);
                      toast.success(`Xin chào, ${user.username}!`);
                      navigate(user.role === 'ADMIN' ? '/admin' : '/');
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || 'Đăng nhập Google thất bại');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                onError={() => {
                  toast.error('Đăng nhập Google thất bại');
                }}
                theme="filled_black"
                shape="pill"
                text="continue_with"
                width="300"
              />
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-primary transition-colors hover:text-secondary">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
