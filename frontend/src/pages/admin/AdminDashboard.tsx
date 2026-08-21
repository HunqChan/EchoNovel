import { useState, useEffect } from 'react';
import {
  BookOpen,
  Headphones,
  Users,
  Crown,
  Loader2,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { statsService } from '../../services/statsService';
import type { AdminStatsResponse } from '../../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

  // Common options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#f1f5f9' } },
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#ffffff10' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
    },
  };

  // 1. User Growth Chart
  const userGrowthData = {
    labels: stats.userGrowth?.map((d) => d.date) || [],
    datasets: [
      {
        label: 'Người dùng mới',
        data: stats.userGrowth?.map((d) => d.value) || [],
        borderColor: '#10b981', // emerald-500
        backgroundColor: '#10b981',
        tension: 0.3,
      },
    ],
  };

  // 2. Revenue Chart
  const revenueData = {
    labels: stats.revenueStats?.map((d) => d.date) || [],
    datasets: [
      {
        label: 'Doanh thu xu',
        data: stats.revenueStats?.map((d) => d.value) || [],
        backgroundColor: '#f59e0b', // amber-500
        borderRadius: 4,
      },
    ],
  };

  // 3. Top Read Stories
  const topReadData = {
    labels: stats.topReadStories?.map((s) => s.title) || [],
    datasets: [
      {
        label: 'Lượt đọc',
        data: stats.topReadStories?.map((s) => s.chapterCount) || [],
        backgroundColor: '#6366f1', // indigo-500
        borderRadius: 4,
      },
    ],
  };

  // 4. Top Liked Stories
  const topLikedData = {
    labels: stats.topLikedStories?.map((s) => s.title) || [],
    datasets: [
      {
        label: 'Lượt thích',
        data: stats.topLikedStories?.map((s) => s.chapterCount) || [],
        backgroundColor: '#ec4899', // pink-500
        borderRadius: 4,
      },
    ],
  };

  // 5. Genre Distribution
  const genreColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];
  const safeGenreDistribution = stats.genreDistribution || {};
  const genreData = {
    labels: Object.keys(safeGenreDistribution),
    datasets: [
      {
        data: Object.values(safeGenreDistribution),
        backgroundColor: genreColors.slice(0, Object.keys(safeGenreDistribution).length),
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { color: '#f1f5f9', font: { size: 11 } } },
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard & Analytics</h1>
      </div>

      {/* ───── Stat Cards ───── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface-light p-5 shadow-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Tổng user</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalUsers}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface-light p-5 shadow-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">User VIP</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalVipUsers}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface-light p-5 shadow-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Gói VIP đã bán</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalVipPackagesSold || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface-light p-5 shadow-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Tổng truyện</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalStories}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface-light p-5 shadow-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Tổng số chương</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalChapters}</p>
          </div>
        </div>
      </div>

      {/* ───── Charts Row 1: Growth & Revenue ───── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl">
          <h3 className="mb-6 flex items-center gap-2 font-bold text-text-primary">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Tăng trưởng người dùng mới (30 ngày)
          </h3>
          <div className="h-64">
            <Line data={userGrowthData} options={commonChartOptions} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl">
          <h3 className="mb-6 flex items-center gap-2 font-bold text-text-primary">
            <Activity className="h-5 w-5 text-amber-400" />
            Doanh thu xu (30 ngày)
          </h3>
          <div className="h-64">
            <Bar data={revenueData} options={commonChartOptions} />
          </div>
        </div>
      </div>

      {/* ───── Charts Row 2: Top Stories ───── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl">
          <h3 className="mb-6 font-bold text-text-primary">Top 5 truyện được đọc nhiều nhất</h3>
          <div className="h-64">
            <Bar data={topReadData} options={{ ...commonChartOptions, indexAxis: 'y' as const }} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl">
          <h3 className="mb-6 font-bold text-text-primary">Top 5 truyện được yêu thích nhất</h3>
          <div className="h-64">
            <Bar data={topLikedData} options={{ ...commonChartOptions, indexAxis: 'y' as const }} />
          </div>
        </div>
      </div>

      {/* ───── Charts Row 3: Distributions ───── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl flex flex-col">
          <h3 className="mb-4 font-bold text-text-primary">Phân bố thể loại truyện</h3>
          <div className="h-64 flex-1">
            <Doughnut data={genreData} options={doughnutOptions} />
          </div>
        </div>
        
        {/* We can repurpose the access level here too */}
        <div className="rounded-2xl border border-white/10 bg-surface-light p-6 shadow-xl flex flex-col">
          <h3 className="mb-4 font-bold text-text-primary">Tỷ lệ khóa chương (Access Level)</h3>
          <div className="h-64 flex-1">
            <Doughnut
              data={{
                labels: Object.keys(stats.accessLevelDistribution || {}),
                datasets: [{
                  data: Object.values(stats.accessLevelDistribution || {}),
                  backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'],
                  borderWidth: 0
                }]
              }}
              options={doughnutOptions}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
