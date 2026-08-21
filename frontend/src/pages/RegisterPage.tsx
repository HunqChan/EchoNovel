import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { BookOpen, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../types';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: '', email: '', password: '', confirmPassword: '' };

    if (!username.trim()) {
      newErrors.username = 'Tên người dùng không được để trống';
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = 'Tên người dùng phải từ 3 ký tự trở lên';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      newErrors.password = 'Mật khẩu phải chứa chữ hoa, chữ thường và ký tự đặc biệt';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await authService.sendRegisterOtp({ email });
      setShowOtpModal(true);
      toast.success('Mã OTP đã được gửi về email của bạn');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi khi gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Vui lòng nhập mã OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({ username, email, password, otp });
      const { token, refreshToken, user } = response.data;

      login(token, refreshToken, user);
      setShowOtpModal(false);
      toast.success('Đăng ký thành công! Chào mừng bạn đến với EchoNovel 🎉');
      navigate('/');
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const data = error.response?.data;

      if (data?.details) {
        // Show first validation error
        const firstError = Object.values(data.details)[0];
        toast.error(firstError);
      } else {
        toast.error(data?.message || 'Đăng ký thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-surface-light to-surface px-4 py-12">
      {/* Glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -left-40 bottom-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
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
            <h1 className="mt-4 text-2xl font-bold text-text-primary">Tạo tài khoản</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Tham gia cộng đồng đọc và nghe truyện
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleInitialSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="reg-username" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Tên người dùng
              </label>
              <input
                id="reg-username"
                type="text"
                required
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors(p => ({...p, username: ''})) }}
                placeholder="echoreader"
                className={`w-full rounded-xl border ${errors.username ? 'border-red-500' : 'border-white/10'} bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20`}
              />
              {errors.username && <p className="mt-1.5 text-xs text-red-500">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})) }}
                placeholder="name@example.com"
                className={`w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-white/10'} bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20`}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})) }}
                  placeholder="Tối thiểu 6 ký tự"
                  className={`w-full rounded-xl border ${errors.password ? 'border-red-500' : 'border-white/10'} bg-surface px-4 py-3 pr-12 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Xác nhận mật khẩu
              </label>
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: ''})) }}
                placeholder="Nhập lại mật khẩu"
                className={`w-full rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-secondary/50 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20`}
              />
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>}
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
                  <UserPlus className="h-5 w-5" />
                  Đăng ký
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
                      toast.success(`Đăng ký bằng Google thành công! Xin chào, ${user.username}!`);
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
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-primary transition-colors hover:text-secondary">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2 text-center">Xác thực Email</h3>
            <p className="text-gray-400 mb-6 text-sm text-center">
              Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi đến email <br/>
              <span className="font-bold text-primary">{email}</span>
            </p>
            
            <form onSubmit={handleVerifyOtpAndRegister}>
              <div className="mb-6">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập mã OTP (6 số)"
                  className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-3 text-center text-lg tracking-[0.2em] font-mono text-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  disabled={loading}
                  className="flex-1 py-3 bg-surface-light hover:bg-white/5 text-gray-300 rounded-xl transition-colors font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
