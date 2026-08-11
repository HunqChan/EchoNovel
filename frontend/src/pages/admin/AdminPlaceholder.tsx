import { Construction } from 'lucide-react';

export default function AdminPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-surface-light p-8 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Construction className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-text-primary">Tính năng đang phát triển</h2>
      <p className="max-w-md text-text-secondary">
        Trang quản lý này hiện đang trong quá trình xây dựng. Vui lòng quay lại sau!
      </p>
    </div>
  );
}
