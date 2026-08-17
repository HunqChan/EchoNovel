import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { VipPackage } from '../../types';

export default function AdminVipPackagesPage() {
  const [packages, setPackages] = useState<VipPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    durationDays: 30,
    priceCoins: 50,
    description: '',
    isActive: true
  });

  const fetchPackages = () => {
    setLoading(true);
    api.get('/admin/vip-packages')
      .then((res: any) => setPackages(res.data.data))
      .catch(() => toast.error('Lỗi tải danh sách gói VIP'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: '', durationDays: 30, priceCoins: 50, description: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEdit = (pkg: VipPackage) => {
    setEditingId(pkg.id);
    setFormData({ ...pkg });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa gói VIP này?')) return;
    try {
      await api.delete(`/admin/vip-packages/${id}`);
      toast.success('Xóa thành công');
      fetchPackages();
    } catch {
      toast.error('Lỗi khi xóa gói VIP');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/vip-packages/${editingId}`, formData);
        toast.success('Cập nhật thành công');
      } else {
        await api.post('/admin/vip-packages', formData);
        toast.success('Thêm mới thành công');
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch {
      toast.error('Lỗi khi lưu gói VIP');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Quản lý Gói VIP</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
        >
          <Plus className="h-5 w-5" />
          Thêm gói mới
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-light shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-xs uppercase text-white">
              <tr>
                <th className="px-6 py-4">Tên gói</th>
                <th className="px-6 py-4">Thời hạn (Ngày)</th>
                <th className="px-6 py-4">Giá (Xu)</th>
                <th className="px-6 py-4">Mô tả</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4 font-bold text-white">{pkg.name}</td>
                  <td className="px-6 py-4">{pkg.durationDays}</td>
                  <td className="px-6 py-4 font-bold text-yellow-500">{pkg.priceCoins}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{pkg.description}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${pkg.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {pkg.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(pkg)} className="text-accent hover:text-accent-light">
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Cập nhật gói VIP' : 'Thêm gói VIP mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 text-sm font-medium text-gray-400 block">Tên gói</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-white outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 text-sm font-medium text-gray-400 block">Thời hạn (ngày)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-white outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 text-sm font-medium text-gray-400 block">Giá (xu)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.priceCoins}
                    onChange={(e) => setFormData({ ...formData, priceCoins: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-white outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 text-sm font-medium text-gray-400 block">Mô tả</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-white outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-primary focus:ring-primary focus:ring-offset-gray-900"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-400">Hiển thị (Active)</label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/5"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/25 hover:bg-primary-dark"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
