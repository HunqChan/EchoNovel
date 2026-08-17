import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';
import { Mail, Key, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    try {
      setIsLoading(true);
      await authService.sendForgotPasswordOtp({ email });
      toast.success('Mã OTP đã được gửi đến email của bạn');
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không tìm thấy tài khoản với email này');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Vui lòng điền đủ thông tin');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }
    try {
      setIsLoading(true);
      await authService.resetPassword({ email, otp, newPassword });
      toast.success('Khôi phục mật khẩu thành công! Hãy đăng nhập lại.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Khôi phục thất bại. Kiểm tra lại mã OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-black text-white tracking-tight mb-2">
            Echo<span className="text-primary">Novel</span>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Khôi phục mật khẩu</h2>
          <p className="text-gray-400">
            {step === 1 ? 'Nhập email tài khoản của bạn để nhận mã OTP' : 'Nhập mã OTP và mật khẩu mới'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                  placeholder="hello@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Gửi mã OTP
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mã OTP (gửi về email)</label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 text-white text-center tracking-widest text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600 placeholder:font-normal placeholder:tracking-normal placeholder:text-sm"
                  placeholder="Nhập 6 số OTP"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu mới</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Khôi phục mật khẩu'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          <Link to="/login" className="hover:text-primary transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
