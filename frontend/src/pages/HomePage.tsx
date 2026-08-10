function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
          📖 EchoNovel
        </h1>
        <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto px-4">
          Đọc & Nghe Truyện với AI Text-to-Speech
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <span className="px-4 py-2 bg-indigo-600/30 text-indigo-200 rounded-lg text-sm border border-indigo-500/30">
            ✅ Backend Ready
          </span>
          <span className="px-4 py-2 bg-green-600/30 text-green-200 rounded-lg text-sm border border-green-500/30">
            ✅ Frontend Ready
          </span>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
