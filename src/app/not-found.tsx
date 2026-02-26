import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-6">
      <h1 className="text-6xl font-black text-red-600">404</h1>
      <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Página não encontrada</p>
      <Link
        href="/"
        className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 border border-slate-800 px-4 py-2 rounded transition-colors"
      >
        Voltar ao mapa
      </Link>
    </div>
  );
}
