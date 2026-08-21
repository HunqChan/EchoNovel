import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { uploadService } from '../services/uploadService';
import { interactionService } from '../services/interactionService';
import { toast } from 'react-hot-toast';
import { User, Shield, Image as ImageIcon, Save, LogOut, Key, Wallet, Crown, ArrowUpRight, ArrowDownRight, Clock, Heart, BookOpen, Upload, Loader2 } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import type { CoinTransaction, FavoriteResponse } from '../types';

const ProfilePage: React.FC = () => {
  const { user, token, refreshToken, logout, login, isVip } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'wallet' | 'favorites'>(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'wallet' || tab === 'security' || tab === 'info' || tab === 'favorites') return tab;
    return 'info';
  });

  // Info Tab State
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // Security Tab State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Wallet Tab State
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Favorites Tab State
  const [favorites, setFavorites] = useState<FavoriteResponse[]>([]);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Fetch latest profile on mount to ensure data is fresh
    const fetchLatestProfile = async () => {
      try {
        if (token) {
          const res: any = await userService.getProfile();
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

  useEffect(() => {
    if (activeTab === 'wallet' && token) {
      setLoadingTx(true);
      api.get('/wallet/transactions')
        .then((res: any) => setTransactions(res.data.data))
        .catch((err: any) => console.error(err))
        .finally(() => setLoadingTx(false));
    }
    if (activeTab === 'favorites' && token) {
      setLoadingFav(true);
      interactionService.getUserFavorites()
        .then((res) => setFavorites(res.data))
        .catch((err: any) => console.error(err))
        .finally(() => setLoadingFav(false));
    }
  }, [activeTab, token]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file ảnh JPG, PNG, WebP');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng file không được vượt quá 5MB');
      return;
    }

    // Show preview immediately
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setSelectedAvatarFile(file);

    // Reset file input so same file can be selected again if cancelled
    if (avatarFileRef.current) avatarFileRef.current.value = '';
  };

  const handleCancelAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setSelectedAvatarFile(null);
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Tên hiển thị không được để trống');
      return;
    }
    try {
      setIsUpdatingInfo(true);
      let finalAvatarUrl = avatarUrl;

      // Upload avatar first if user selected a file
      if (selectedAvatarFile) {
        setIsUploadingAvatar(true);
        const res = await uploadService.uploadAvatar(selectedAvatarFile);
        finalAvatarUrl = res.data.avatarUrl || '';
        setAvatarUrl(finalAvatarUrl);
        setAvatarPreview(null);
        setSelectedAvatarFile(null);
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setIsUploadingAvatar(false);
      }

      const res = await userService.updateProfile({ username, avatarUrl: finalAvatarUrl });
      toast.success('Cập nhật hồ sơ thành công!');
      if (user && token && refreshToken) {
        login(token, refreshToken, { ...user, username, avatarUrl: finalAvatarUrl });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
      setIsUploadingAvatar(false);
    } finally {
      setIsUpdatingInfo(false);
      setIsUploadingAvatar(false);
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
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}/.test(newPassword)) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự, chứa chữ hoa, chữ thường và ký tự đặc biệt');
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
              {isVip && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-md shadow-lg border border-yellow-400">
                  {user.vipType === 'PERMANENT' ? 'VIP Vĩnh Viễn' : 'VIP'}
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
                onClick={() => setActiveTab('wallet')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'wallet' ? 'bg-primary/20 text-primary font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <Wallet className="w-5 h-5" />
                Ví & VIP
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'favorites' ? 'bg-primary/20 text-primary font-medium' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <Heart className="w-5 h-5" />
                Truyện yêu thích
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
                    <label className="block text-sm font-medium text-gray-300 mb-3">Ảnh đại diện</label>
                    <div className="flex items-start gap-6">
                      {/* Avatar Preview */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={avatarPreview || avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=4f46e5&color=fff`}
                          alt="Avatar preview"
                          className="w-20 h-20 rounded-full object-cover border-4 border-gray-700 shadow-lg"
                        />
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        {/* File Upload Buttons */}
                        <div className="flex items-center gap-2">
                          <input
                            ref={avatarFileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarFileChange}
                            className="hidden"
                            id="avatar-file-input"
                          />
                          <button
                            type="button"
                            onClick={() => avatarFileRef.current?.click()}
                            disabled={isUploadingAvatar || isUpdatingInfo}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed border border-gray-600"
                          >
                            <Upload className="w-4 h-4" />
                            Chọn ảnh đại diện
                          </button>
                          {selectedAvatarFile && (
                            <button
                              type="button"
                              onClick={handleCancelAvatar}
                              disabled={isUploadingAvatar || isUpdatingInfo}
                              className="text-sm font-medium py-2.5 px-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">JPG, PNG hoặc WebP. Tối đa 5MB.</p>
                        {/* Fallback: URL input */}
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 pl-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            placeholder="Hoặc dán link ảnh..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <button
                      type="submit"
                      disabled={isUpdatingInfo || isUploadingAvatar}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {(isUpdatingInfo || isUploadingAvatar) ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {isUploadingAvatar ? 'Đang tải ảnh...' : 'Lưu thay đổi'}
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

            {activeTab === 'wallet' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Ví & Gói VIP</h3>

                {/* Balance & VIP Card */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Crown className="w-32 h-32 text-yellow-500" />
                  </div>
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm font-medium mb-1">Số dư Xu</p>
                      <div className="flex items-end gap-2 mt-2">
                        <span className="text-4xl font-bold text-yellow-500">{user.coins?.toLocaleString() || 0}</span>
                        <span className="text-gray-400 pb-1">xu</span>
                      </div>
                      <button
                        onClick={() => toast('Tính năng thanh toán đang được phát triển!')}
                        className="mt-3 px-4 py-1.5 bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 shadow-md shadow-primary/25"
                      >
                        Nạp xu
                      </button>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium mb-1">Trạng thái VIP</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${isVip ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-400'}`}>
                          <Crown className="w-4 h-4" />
                          {isVip ? (user.vipType === 'PERMANENT' ? 'VIP Vĩnh Viễn' : 'VIP Có Thời Hạn') : 'Thành Viên Thường'}
                        </span>
                      </div>
                      {user.vipType === 'SUBSCRIPTION' && user.vipExpireAt && (
                        <p className={`text-sm mt-2 flex items-center gap-1.5 ${isVip ? 'text-gray-400' : 'text-red-400'}`}>
                          <Clock className="w-4 h-4" />
                          {isVip ? 'Hết hạn:' : 'Đã hết hạn lúc:'} <span className="font-medium text-white">{new Date(user.vipExpireAt).toLocaleString('vi-VN')}</span>
                        </p>
                      )}
                      {!isVip && (
                        <Link to="/upgrade" className="inline-block mt-3 text-sm text-primary hover:text-primary-light transition-colors">
                          Nâng cấp VIP ngay →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">Lịch sử giao dịch</h4>
                  {loadingTx ? (
                    <div className="text-center py-8 text-gray-500">Đang tải...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800 text-gray-500">
                      Chưa có giao dịch nào
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map(tx => (
                        <div key={tx.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {tx.amount > 0 ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-white font-medium">{tx.description}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                          </div>
                          <div className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-white'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Truyện yêu thích</h3>
                {loadingFav ? (
                  <div className="text-center py-8 text-gray-500">Đang tải...</div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                    <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Bạn chưa yêu thích truyện nào.</p>
                    <Link to="/stories" className="inline-block mt-3 text-sm text-primary hover:underline">Khám phá truyện →</Link>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                    {favorites.map((fav) => (
                      <Link
                        key={fav.storyId}
                        to={`/stories/${fav.storyId}`}
                        className="group flex flex-col gap-2 rounded-xl border border-gray-800 bg-gray-900/50 p-2.5 transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-800">
                          {fav.coverImage ? (
                            <img src={fav.coverImage} alt={fav.storyTitle} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                              <BookOpen className="h-10 w-10 text-white/20" />
                            </div>
                          )}
                        </div>
                        <div className="px-1 pb-1">
                          <h4 className="line-clamp-2 text-sm font-bold text-white group-hover:text-primary transition-colors">{fav.storyTitle}</h4>
                          <p className="text-[11px] text-gray-400 mt-1">{fav.authorName}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
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
