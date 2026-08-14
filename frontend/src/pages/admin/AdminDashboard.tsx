import { useState, useEffect } from 'react';
import {
  BookOpen,
  Headphones,
  Users,
  Crown,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { statsService } from '../../services/statsService';
import type { AdminStatsResponse } from '../../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    statsService
      .getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Không thể tải dữ liệu thống kê.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="text-xl font-bold text-red-400">Lỗi tải dữ liệu</h2>
        <p className="mt-2 text-sm text-red-400/80">{error}</p>
      </div>
    );
  }

  // Bar Chart Data
  const safeTopStories = stats.topStories || [];
  const barData = {
    labels: safeTopStories.map((s) => s.title),
    datasets: [
      {
        label: 'Số chương',
        data: safeTopStories.map((s) => s.chapterCount),
        backgroundColor: '#6366f1',
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Top 5 Truyện Có Nhiều Chương Nhất',
        color: '#f1f5f9',
        font: { size: 16 },
      },
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#ffffff10' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
    },
  };

  // Doughnut Chart Data
  const accessColors: Record<string, string> = {
    PUBLIC: '#22c55e', // Green
    MEMBER: '#3b82f6', // Blue
    VIP: '#f59e0b',    // Yellow
  };

  const safeDistribution = stats.accessLevelDistribution || {};
  const doughnutData = {
    labels: Object.keys(safeDistribution),
    datasets: [
      {
        data: Object.values(safeDistribution),
        backgroundColor: Object.keys(safeDistribution).map(
          (key) => accessColors[key] || '#94a3b8'
        ),
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#f1f5f9' } },
      title: {
        display: true,
        text: 'Tỷ lệ khóa chương',
        color: '#f1f5f9',
        font: { size: 16 },
      },
    },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Tổng truyện</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalStories}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Tổng số chương</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalChapters}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Tổng người dùng</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Thành viên VIP</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalVipUsers}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl lg:col-span-2">
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl">
          <div className="w-full max-w-[250px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
