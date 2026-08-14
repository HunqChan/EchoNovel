import { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { genreService } from '../../services/genreService';
import type { GenreResponse } from '../../types';

export default function AdminGenresPage() {
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [newGenreName, setNewGenreName] = useState('');
  const [editingGenre, setEditingGenre] = useState<GenreResponse | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const genreRes = await genreService.getGenres();
      setGenres(genreRes.data);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu thể loại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    try {
      await genreService.createGenre({ name: newGenreName });
      toast.success('Thêm thể loại thành công');
      setNewGenreName('');
      fetchData();
    } catch (err) {
      toast.error('Lỗi thêm thể loại');
    }
  };

  const handleEditGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGenre || !editingGenre.name.trim()) return;
    try {
      await genreService.updateGenre(editingGenre.id, { name: editingGenre.name });
      toast.success('Cập nhật thể loại thành công');
      setEditingGenre(null);
      fetchData();
    } catch (err) {
      toast.error('Lỗi cập nhật thể loại');
    }
  };

  const handleDeleteGenre = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa thể loại này?')) {
      try {
        await genreService.deleteGenre(id);
        toast.success('Xóa thể loại thành công');
        fetchData();
      } catch (err) {
        toast.error('Lỗi xóa thể loại (có thể đang có truyện dùng thể loại này)');
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
      <h1 className="text-2xl font-bold text-text-primary text-center sm:text-left">Quản lý Thể loại</h1>

      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm thể loại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-surface px-4 py-2 text-sm text-text-primary outline-none focus:border-primary/50"
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Thêm Thể Loại
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-light">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-white/5 text-xs uppercase text-text-primary">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3 w-full">Tên thể loại</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {genres
                .filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((genre) => (
                <tr key={genre.id} className="transition-colors hover:bg-white/5">
                  <td className="px-4 py-3">{genre.id}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {editingGenre?.id === genre.id ? (
                      <form onSubmit={handleEditGenre} className="flex gap-2">
                        <input
                          type="text"
                          value={editingGenre.name}
                          onChange={(e) => setEditingGenre({ ...editingGenre, name: e.target.value })}
                          className="w-full rounded bg-surface px-2 py-1 outline-none border border-primary/50"
                          autoFocus
                        />
                      </form>
                    ) : (
                      genre.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingGenre?.id === genre.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={handleEditGenre} className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10">Lưu</button>
                        <button onClick={() => setEditingGenre(null)} className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5">Hủy</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setEditingGenre(genre)} className="inline-flex items-center justify-center rounded-lg p-2 text-accent transition-colors hover:bg-accent/10" title="Sửa thể loại">
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteGenre(genre.id)} className="inline-flex items-center justify-center rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10" title="Xóa thể loại">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {genres.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-text-secondary">
                    Chưa có thể loại nào.
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
              <h2 className="text-xl font-bold text-text-primary">Thêm thể loại mới</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-secondary hover:text-white">✕</button>
            </div>
            <div className="p-6">
              <form id="addGenreForm" onSubmit={(e) => {
                handleAddGenre(e);
                if (newGenreName.trim()) setIsAddModalOpen(false);
              }} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tên thể loại</label>
                  <input
                    type="text"
                    placeholder="VD: Kiếm Hiệp..."
                    value={newGenreName}
                    onChange={(e) => setNewGenreName(e.target.value)}
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
              <button type="submit" form="addGenreForm" disabled={!newGenreName.trim()} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 hover:bg-primary-dark disabled:opacity-50">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
