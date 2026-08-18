import { useState, useEffect } from 'react';
import { Loader2, Crown, ShieldAlert, Edit2, Trash2, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { userService } from '../../services/userService';
import type { UserResponse } from '../../types';
import type { AxiosError } from 'axios';

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: state.isFocused ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.75rem',
    padding: '2px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#6366f1'
    }
  }),
  menu: (base: any) => ({
    ...base,
    background: '#2d2a3e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.75rem',
    overflow: 'hidden'
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#6366f1' 
      : state.isFocused 
        ? 'rgba(255,255,255,0.1)' 
        : 'transparent',
    color: '#f1f5f9',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#6366f1'
    }
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#f1f5f9'
  }),
  input: (base: any) => ({
    ...base,
    color: '#f1f5f9'
  })
};

const roleOptions = [
  { value: 'MEMBER', label: 'MEMBER' },
  { value: 'ADMIN', label: 'ADMIN' }
];

const vipOptions = [
  { value: 'NONE', label: 'Thường' },
  { value: 'SUBSCRIPTION', label: 'Có thời hạn' },
  { value: 'PERMANENT', label: 'Vĩnh viễn' }
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ isOpen: false, title: '', message: '', action: () => {} });

  const [editUserModal, setEditUserModal] = useState<{
    isOpen: boolean;
    user: UserResponse | null;
    role: string;
    vipType: string;
    vipExpireAt: string;
  }>({ isOpen: false, user: null, role: 'MEMBER', vipType: 'NONE', vipExpireAt: '' });

  const [addCoinsModal, setAddCoinsModal] = useState<{
    isOpen: boolean;
    user: UserResponse | null;
    amount: number;
    description: string;
  }>({ isOpen: false, user: null, amount: 0, description: 'Admin cấp xu' });

  const fetchUsers = () => {
    setLoading(true);
    userService
      .getUsers()
      .then((res) => setUsers(res.data))
      .catch((err: AxiosError) => {
        toast.error('Lỗi tải danh sách người dùng');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Không dùng toggleVip cũ nữa, dùng update user chung

  const openDeleteConfirm = (user: UserResponse) => {
    if (user.role === 'ADMIN') {
      toast.error('Không thể xóa tài khoản Admin!');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa người dùng',
      message: `Bạn có chắc chắn muốn xóa tài khoản "${user.username}" không? Hành động này không thể hoàn tác.`,
      action: async () => {
        try {
          await userService.deleteUser(user.id);
          toast.success('Xóa người dùng thành công');
          fetchUsers();
        } catch (err) {
          toast.error('Lỗi khi xóa người dùng');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleOpenEditUser = (user: UserResponse) => {
    setEditUserModal({
      isOpen: true,
      user,
      role: user.role,
      vipType: user.vipType || 'NONE',
      vipExpireAt: user.vipExpireAt ? user.vipExpireAt.substring(0, 16) : ''
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal.user) return;
    
    try {
      await userService.updateUser(editUserModal.user.id, {
        role: editUserModal.role,
        vipType: editUserModal.vipType,
        vipExpireAt: (editUserModal.vipType === 'SUBSCRIPTION' && editUserModal.vipExpireAt) ? new Date(editUserModal.vipExpireAt).toISOString() : undefined
      });
      toast.success('Cập nhật thông tin người dùng thành công');
      setEditUserModal({ isOpen: false, user: null, role: 'MEMBER', vipType: 'NONE', vipExpireAt: '' });
      fetchUsers();
    } catch (err) {
      toast.error('Lỗi khi cập nhật người dùng');
    }
  };

  const handleAddCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCoinsModal.user || addCoinsModal.amount <= 0) return;
    
    try {
      // NOTE: Assume we will add `addCoins` method to `userService`
      // await userService.addCoins(addCoinsModal.user.id, addCoinsModal.amount, addCoinsModal.description);
      // For now we use custom fetch or add to service
      await import('../../services/api').then((mod) => {
        return mod.default.post(`/admin/users/${addCoinsModal.user?.id}/coins?amount=${addCoinsModal.amount}&description=${encodeURIComponent(addCoinsModal.description)}`);
      });
      toast.success('Cấp xu thành công');
      setAddCoinsModal({ isOpen: false, user: null, amount: 0, description: 'Admin cấp xu' });
      fetchUsers();
    } catch (err) {
      toast.error('Lỗi khi cấp xu');
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
        <h1 className="text-2xl font-bold text-text-primary">Quản lý Người Dùng</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-light shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-white/5 text-xs uppercase text-text-primary">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Quyền hạn</th>
                <th className="px-6 py-4">Số dư Xu</th>
                <th className="px-6 py-4 text-center">Trạng thái VIP</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4">{user.id}</td>
                  <td className="px-6 py-4 font-medium text-text-primary">
                    {user.username}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                        <ShieldAlert className="h-3 w-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                        Member
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-yellow-400">
                    {user.coins?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        (user.vipType === 'PERMANENT' || (user.vipType === 'SUBSCRIPTION' && user.vipExpireAt && new Date(user.vipExpireAt) > new Date()))
                          ? 'bg-accent/20 text-accent'
                          : 'bg-white/10 text-text-secondary'
                      }`}
                    >
                      <Crown className="h-3.5 w-3.5" />
                      {user.vipType === 'SUBSCRIPTION' && (!user.vipExpireAt || new Date(user.vipExpireAt) <= new Date()) ? 'Hết hạn VIP' : user.vipType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setAddCoinsModal({ isOpen: true, user, amount: 100, description: 'Admin cấp xu' })}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-yellow-400 transition-colors hover:bg-yellow-400/10"
                        title="Cấp xu"
                      >
                        <Coins className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditUser(user)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-accent transition-colors hover:bg-accent/10"
                        title="Sửa người dùng"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(user)}
                        disabled={user.role === 'ADMIN'}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Xóa người dùng"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOM CONFIRM MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface shadow-2xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-text-secondary mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="rounded-xl px-4 py-2 text-sm font-medium text-text-secondary hover:bg-white/5 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={confirmModal.action}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUserModal.isOpen && editUserModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface shadow-2xl overflow-visible">
            <div className="flex items-center justify-between border-b border-white/10 bg-surface-light px-6 py-4">
              <h2 className="text-xl font-bold text-text-primary">Sửa thông tin người dùng</h2>
              <button onClick={() => setEditUserModal(prev => ({ ...prev, isOpen: false }))} className="text-text-secondary hover:text-white">✕</button>
            </div>
            <div className="p-6 overflow-visible">
              <form id="editUserForm" onSubmit={handleUpdateUser} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tên đăng nhập</label>
                  <input
                    type="text"
                    readOnly
                    value={editUserModal.user.username}
                    className="w-full rounded-xl border border-white/10 bg-surface-light/50 px-4 py-2.5 text-text-secondary outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Email</label>
                  <input
                    type="email"
                    readOnly
                    value={editUserModal.user.email}
                    className="w-full rounded-xl border border-white/10 bg-surface-light/50 px-4 py-2.5 text-text-secondary outline-none cursor-not-allowed"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Quyền hạn (Role)</label>
                    <Select
                      options={roleOptions}
                      value={roleOptions.find(opt => opt.value === editUserModal.role)}
                      onChange={(selected) => setEditUserModal(prev => ({ ...prev, role: selected ? selected.value : 'MEMBER' }))}
                      styles={selectStyles}
                      isClearable={false}
                      isSearchable={false}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Trạng thái VIP</label>
                    <Select
                      options={vipOptions}
                      value={vipOptions.find(opt => opt.value === editUserModal.vipType)}
                      onChange={(selected) => setEditUserModal(prev => ({ ...prev, vipType: selected ? selected.value : 'NONE' }))}
                      styles={selectStyles}
                      isClearable={false}
                      isSearchable={false}
                      menuPosition="fixed"
                    />
                  </div>
                </div>
                {editUserModal.vipType === 'SUBSCRIPTION' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Thời hạn VIP</label>
                    <input
                      type="datetime-local"
                      required
                      value={editUserModal.vipExpireAt}
                      onChange={(e) => setEditUserModal(prev => ({ ...prev, vipExpireAt: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-text-primary outline-none focus:border-accent"
                    />
                  </div>
                )}
              </form>
            </div>
            <div className="border-t border-white/10 bg-surface-light px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setEditUserModal(prev => ({ ...prev, isOpen: false }))} className="rounded-xl px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/5">
                Hủy
              </button>
              <button type="submit" form="editUserForm" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 hover:bg-primary-dark">
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD COINS MODAL */}
      {addCoinsModal.isOpen && addCoinsModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 bg-surface-light px-6 py-4">
              <h2 className="text-xl font-bold text-text-primary">Cấp Xu</h2>
              <button onClick={() => setAddCoinsModal(prev => ({ ...prev, isOpen: false }))} className="text-text-secondary hover:text-white">✕</button>
            </div>
            <div className="p-6">
              <form id="addCoinsForm" onSubmit={handleAddCoins} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tài khoản</label>
                  <input
                    type="text"
                    readOnly
                    value={addCoinsModal.user.username}
                    className="w-full rounded-xl border border-white/10 bg-surface-light/50 px-4 py-2 text-text-secondary outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Số xu thêm</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={addCoinsModal.amount}
                    onChange={(e) => setAddCoinsModal(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-text-primary outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Ghi chú</label>
                  <input
                    type="text"
                    required
                    value={addCoinsModal.description}
                    onChange={(e) => setAddCoinsModal(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-text-primary outline-none focus:border-accent"
                  />
                </div>
              </form>
            </div>
            <div className="border-t border-white/10 bg-surface-light px-6 py-4 flex justify-end gap-3">
              <button type="button" onClick={() => setAddCoinsModal(prev => ({ ...prev, isOpen: false }))} className="rounded-xl px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/5">
                Hủy
              </button>
              <button type="submit" form="addCoinsForm" className="rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-medium text-black font-semibold shadow-lg shadow-yellow-500/25 hover:bg-yellow-400">
                Xác nhận cấp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
