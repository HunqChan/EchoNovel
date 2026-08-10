export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
        <p className="mt-1 text-sm text-text-secondary">Tổng quan hệ thống EchoNovel</p>
      </div>

      {/* Stat cards placeholder */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Truyện', value: '—', color: 'from-primary to-indigo-400' },
          { label: 'Chương', value: '—', color: 'from-secondary to-purple-400' },
          { label: 'Người dùng', value: '—', color: 'from-emerald-500 to-teal-400' },
          { label: 'Thể loại', value: '—', color: 'from-accent to-orange-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/10 bg-surface-light p-5"
          >
            <p className="text-sm text-text-secondary">{stat.label}</p>
            <p className={`mt-1 bg-gradient-to-r ${stat.color} bg-clip-text text-3xl font-bold text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-surface-light p-6">
        <p className="text-center text-text-secondary">
          📊 Thống kê chi tiết sẽ được triển khai ở các tuần tiếp theo
        </p>
      </div>
    </div>
  );
}
