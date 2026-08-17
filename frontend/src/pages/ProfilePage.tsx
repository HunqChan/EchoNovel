import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';
import { User, Shield, Image as ImageIcon, Save, LogOut, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, token, refreshToken, logout, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  // Info Tab State
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  // Security Tab State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Fetch latest profile on mount to ensure data is fresh
    const fetchLatestProfile = async () => {
      try {
        if (token) {
          const res = await userService.getProfile();
          // Update the context and localStorage with the fresh user data
          login(token, refreshToken || '', res.data);
          setUsername(res.data.username);
          setAvatarUrl(res.data.avatarUrl || '');
        }
      } catch (error) {
        console.error('Failed to fetch latest profile', error);
      }
    };
    
    fetchLatestProfile();
  }, [navigate]); // Intentionally not including user/token to avoid infinite loops

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Tên hiển thị không được để trống');
      return;
    }
    try {
      setIsUpdatingInfo(true);
      const res = await userService.updateProfile({ username, avatarUrl });
      toast.success(res.message);
      if (user && token && refreshToken) {
        login(token, refreshToken, { ...user, username, avatarUrl });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setIsSendingOtp(true);
      const res = await userService.sendChangePasswordOtp();
      toast.success(res.message);
      setOtpSent(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi OTP thất bại');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !otp) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    try {
      setIsChangingPassword(true);
      const res = await userService.changePassword({ oldPassword, newPassword, otp });
      toast.success(res.message);
      setOldPassword('');
      setNewPassword('');
      setOtp('');
      setOtpSent(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-surface rounded-2xl shadow-lg border border-gray-800 p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=4f46e5&color=fff`}
                alt={user.username}
                className="w-full h-full rounded-full object-cover border-4 border-gray-800 shadow-md"
              />
              {user.isVip && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-md shadow-lg border border-yellow-400">
                  VIP
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-1">{user.username}</h2>
            <p className="text-sm text-gray-400 text-center mb-6">{user.email}</p>

            <div className="w-full space-y-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'info' ? 'bg-primary/20 text-primary font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <User className="w-5 h-5" />
                Thông tin chung
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'security' ? 'bg-primary/20 text-primary font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <Shield className="w-5 h-5" />
                Bảo mật
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors mt-4"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-surface rounded-2xl shadow-lg border border-gray-800 p-6 sm:p-8">
            
            {activeTab === 'info' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h3>
                <form onSubmit={handleUpdateInfo} className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-gray-900 border border-gray-700 text-gray-500 rounded-xl px-4 py-3 focus:outline-none cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-2">Email không thể thay đổi sau khi đăng ký.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tên hiển thị</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="Nhập tên hiển thị mới"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ảnh đại diện (URL)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <button
                      type="submit"
                      disabled={isUpdatingInfo}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isUpdatingInfo ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Đảo mật khẩu</h3>
                
                {user.provider === 'GOOGLE' ? (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
                    <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-blue-100 mb-2">Tài khoản Google</h4>
                    <p className="text-blue-200/70 text-sm">
                      Bạn đang đăng nhập bằng tài khoản Google. Mật khẩu của bạn được quản lý bởi Google và không thể thay đổi tại đây.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu hiện tại</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          placeholder="Nhập mật khẩu cũ"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Mã xác nhận (OTP)</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="flex-1 bg-gray-900 border border-gray-700 text-white text-center tracking-widest text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          placeholder="X X X X X X"
                          maxLength={6}
                        />
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-primary font-medium rounded-xl border border-gray-700 transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                          {isSendingOtp ? 'Đang gửi...' : (otpSent ? 'Gửi lại mã' : 'Nhận mã OTP')}
                        </button>
                      </div>
                      {otpSent && <p className="text-xs text-green-400 mt-2">Mã OTP đã được gửi về email của bạn.</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu mới</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                      <button
                        type="submit"
                        disabled={isChangingPassword || !otpSent}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isChangingPassword ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        Cập nhật mật khẩu
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
