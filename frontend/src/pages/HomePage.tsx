import { Link } from 'react-router-dom';
import { BookOpen, Headphones, Lock, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* ───── Hero Section ───── */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        {/* Glow effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-secondary/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI-powered Text-to-Speech
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-text-primary">Đọc &amp; Nghe Truyện</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Mọi lúc, Mọi nơi
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            EchoNovel là nền tảng đọc và nghe truyện trực tuyến với công nghệ AI
            Text-to-Speech. Kho truyện phong phú, trải nghiệm mượt mà.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-primary to-secondary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Bắt đầu miễn phí
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-surface-light px-8 py-3.5 text-sm font-semibold text-text-primary transition-colors hover:bg-white/5"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Features Section ───── */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-primary">
            Tính năng nổi bật
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: 'Kho Truyện Phong Phú',
                description: 'Hàng nghìn truyện thuộc nhiều thể loại: tiên hiệp, ngôn tình, trinh thám, khoa học viễn tưởng...',
                gradient: 'from-primary to-indigo-400',
              },
              {
                icon: Headphones,
                title: 'AI Đọc Truyện',
                description: 'Công nghệ Text-to-Speech tiên tiến giúp bạn nghe truyện mọi lúc mọi nơi, rảnh tay hoàn toàn.',
                gradient: 'from-secondary to-purple-400',
              },
              {
                icon: Lock,
                title: 'Nội Dung Độc Quyền',
                description: 'Nâng cấp VIP để mở khóa các chương độc quyền và trải nghiệm đọc không giới hạn.',
                gradient: 'from-accent to-orange-400',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/5 bg-surface-light p-6 transition-all hover:border-white/10 hover:shadow-lg hover:shadow-primary/5"
              >
                <div
                  className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 shadow-lg`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text-primary">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
