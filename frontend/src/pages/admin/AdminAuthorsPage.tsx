import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authorService } from '../../services/authorService';
import type { AuthorResponse } from '../../types';

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [newAuthorName, setNewAuthorName] = useState('');
  const [editingAuthor, setEditingAuthor] = useState<AuthorResponse | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const authorRes = await authorService.getAuthors();
      setAuthors(authorRes.data);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu tác giả');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim()) return;
    try {
      await authorService.createAuthor({ name: newAuthorName });
      toast.success('Thêm tác giả thành công');
      setNewAuthorName('');
      fetchData();
    } catch (err) {
      toast.error('Lỗi thêm tác giả');
    }
  };

  const handleEditAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor || !editingAuthor.name.trim()) return;
    try {
      await authorService.updateAuthor(editingAuthor.id, { name: editingAuthor.name });
      toast.success('Cập nhật tác giả thành công');
      setEditingAuthor(null);
      fetchData();
    } catch (err) {
      toast.error('Lỗi cập nhật tác giả');
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa tác giả này?')) {
      try {
        await authorService.deleteAuthor(id);
        toast.success('Xóa tác giả thành công');
        fetchData();
      } catch (err) {
        toast.error('Lỗi xóa tác giả (có thể đang có truyện của tác giả này)');
      }
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
      <h1 className="text-2xl font-bold text-text-primary text-center sm:text-left">Quản lý Tác giả</h1>

      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-surface px-4 py-2 text-sm text-text-primary outline-none focus:border-primary/50"
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            <Plus className="h-4 w-4" />
            Thêm Tác Giả
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-light">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-white/5 text-xs uppercase text-text-primary">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3 w-full">Tên tác giả</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {authors
                .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((author) => (
                <tr key={author.id} className="transition-colors hover:bg-white/5">
                  <td className="px-4 py-3">{author.id}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {editingAuthor?.id === author.id ? (
                      <form onSubmit={handleEditAuthor} className="flex gap-2">
                        <input
                          type="text"
                          value={editingAuthor.name}
                          onChange={(e) => setEditingAuthor({ ...editingAuthor, name: e.target.value })}
                          className="w-full rounded bg-surface px-2 py-1 outline-none border border-accent/50"
                          autoFocus
                        />
                      </form>
                    ) : (
                      author.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingAuthor?.id === author.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={handleEditAuthor} className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10">Lưu</button>
                        <button onClick={() => setEditingAuthor(null)} className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5">Hủy</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setEditingAuthor(author)} className="inline-flex items-center justify-center rounded-lg p-2 text-accent transition-colors hover:bg-accent/10" title="Sửa tác giả">
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteAuthor(author.id)} className="inline-flex items-center justify-center rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10" title="Xóa tác giả">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {authors.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-text-secondary">
                    Chưa có tác giả nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 bg-surface-light px-6 py-4">
              <h2 className="text-xl font-bold text-text-primary">Thêm tác giả mới</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-secondary hover:text-white">✕</button>
            </div>
            <div className="p-6">
              <form id="addAuthorForm" onSubmit={(e) => {
                handleAddAuthor(e);
                if (newAuthorName.trim()) setIsAddModalOpen(false);
              }} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tên tác giả</label>
                  <input
                    type="text"
                    placeholder="VD: Kim Dung..."
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-text-primary outline-none focus:border-primary/50"
                    autoFocus
                  />
                </div>
              </form>
            </div>
            <div className="border-t border-white/10 bg-surface-light px-6 py-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/5">
                Hủy
              </button>
              <button type="submit" form="addAuthorForm" disabled={!newAuthorName.trim()} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/25 hover:bg-orange-500 disabled:opacity-50">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
