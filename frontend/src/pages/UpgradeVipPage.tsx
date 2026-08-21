import { useState, useEffect } from 'react';
import { Crown, Loader2, Check } from 'lucide-react';
import api from '../services/api';
import type { VipPackage } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function UpgradeVipPage() {
  const [packages, setPackages] = useState<VipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<VipPackage | null>(null);
  
  const { user, isAuthenticated, isVip, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/vip-packages')
      .then((res: any) => setPackages(res.data.data))
      .catch(() => toast.error('Lỗi tải danh sách gói VIP'))
      .finally(() => setLoading(false));
  }, []);

  const handleBuyClick = (pkg: VipPackage) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để nâng cấp VIP');
      navigate('/login');
      return;
    }
    if (user?.vipType === 'PERMANENT') {
      toast.error('Bạn đã là VIP vĩnh viễn!');
      return;
    }
    setSelectedPackage(pkg);
  };

  const handleBuy = async (pkg: VipPackage) => {
    if ((user?.coins || 0) < pkg.priceCoins) {
      toast.error('Số dư xu không đủ! Vui lòng nạp thêm.');
      return;
    }

    try {
      setBuyingId(pkg.id);
      await api.post(`/wallet/buy-vip/${pkg.id}`);
      toast.success(`Đăng ký thành công ${pkg.name}!`);
      
      // Update user state locally
      // Assuming vipType becomes SUBSCRIPTION and coins deducted. Expiration handled on server but we do rough estimate.
      const newExpire = user?.vipExpireAt && new Date(user.vipExpireAt) > new Date()
        ? new Date(new Date(user.vipExpireAt).getTime() + pkg.durationDays * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + pkg.durationDays * 24 * 60 * 60 * 1000);
        
      updateUser({
        ...user!,
        coins: user!.coins - pkg.priceCoins,
        vipType: 'SUBSCRIPTION',
        vipExpireAt: newExpire.toISOString()
      });
      
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi mua gói');
    } finally {
      setBuyingId(null);
      setSelectedPackage(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Trở thành Thành Viên VIP</h1>
        <p className="text-lg text-gray-400">
          Tận hưởng đặc quyền đọc tất cả các chương VIP của tất cả các bộ truyện trên hệ thống. Không quảng cáo, trải nghiệm đọc trọn vẹn nhất.
        </p>
      </div>

      {isAuthenticated && (
        <div className="bg-surface border border-gray-800 rounded-2xl p-6 mb-12 flex justify-between items-center max-w-lg mx-auto">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-400">Số dư hiện tại</p>
              <p className="text-2xl font-bold text-yellow-500">{user?.coins?.toLocaleString() || 0} <span className="text-base text-gray-400 font-normal">xu</span></p>
            </div>
            <button
              onClick={() => toast('Tính năng thanh toán đang được phát triển!')}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/25"
            >
              Nạp xu
            </button>
          </div>
          {user?.vipType === 'PERMANENT' ? (
            <div className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg font-semibold">VIP Vĩnh Viễn</div>
          ) : user?.vipType === 'SUBSCRIPTION' ? (
            <div className="text-right">
              <div className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-lg font-semibold text-sm inline-block mb-1">VIP Đang Hoạt Động</div>
              <p className="text-xs text-gray-400">Đến: {user.vipExpireAt ? new Date(user.vipExpireAt).toLocaleDateString('vi-VN') : ''}</p>
            </div>
          ) : null}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-surface-light border border-gray-800 rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10">
            {pkg.durationDays >= 180 && (
              <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                PHỔ BIẾN
              </div>
            )}
            <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
            <p className="text-sm text-gray-400 mb-6 flex-1">{pkg.description}</p>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-yellow-500">{pkg.priceCoins}</span>
              <span className="text-gray-400 ml-1">xu</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-500" />
                Mở khóa mọi chương VIP
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-500" />
                Thời hạn {pkg.durationDays} ngày
              </li>
            </ul>

            {!isVip && (
              <button
                onClick={() => handleBuyClick(pkg)}
                disabled={buyingId !== null}
                className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {buyingId === pkg.id && <Loader2 className="w-5 h-5 animate-spin" />}
                Mua ngay
              </button>
            )}
            {isVip && (
              <div className="w-full py-3 px-4 bg-white/5 text-gray-400 font-bold rounded-xl text-center border border-white/10">
                Bạn đang là VIP
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Xác nhận nâng cấp VIP</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Bạn có chắc chắn muốn mua gói <span className="font-bold text-yellow-500">{selectedPackage.name}</span> với giá <span className="font-bold text-yellow-500">{selectedPackage.priceCoins} xu</span> không?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedPackage(null)}
                disabled={buyingId !== null}
                className="px-4 py-2 bg-surface-light hover:bg-white/5 text-gray-300 rounded-xl transition-colors text-sm font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={() => handleBuy(selectedPackage)}
                disabled={buyingId !== null}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {buyingId === selectedPackage.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
