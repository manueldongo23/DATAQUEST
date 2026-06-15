import { useState, useEffect } from 'react';

interface PuzzleItem {
  id: number;
  title: string;
  difficulty: number;
  xp: number;
  type: 'Puzzle' | 'Reto Semanal';
}

const DEFAULT_PUZZLES: PuzzleItem[] = [
  { id: 1, title: 'El Caso del Estudiante Duplicado', difficulty: 1, xp: 50, type: 'Puzzle' },
  { id: 2, title: 'Inventarios Infinitos', difficulty: 2, xp: 120, type: 'Puzzle' },
  { id: 3, title: 'Pedidos Fantasmas', difficulty: 4, xp: 300, type: 'Reto Semanal' },
];

export const GamesView: React.FC = () => {
  const [puzzles, setPuzzles] = useState<PuzzleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPuzzles = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API call when endpoint is available
        // const response = await axiosInstance.get<PuzzleItem[]>('/games/puzzles');
        // setPuzzles(response.data);
        await new Promise(r => setTimeout(r, 600));
        setPuzzles(DEFAULT_PUZZLES);
      } catch {
        setError('Error al cargar los juegos. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchPuzzles();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Cargando juegos..." role="status">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-slate-200 rounded mt-2 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-8 w-20 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-32 bg-slate-200 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20" role="alert">
        <span className="text-5xl mb-4" aria-hidden="true">⚠️</span>
        <p className="text-slate-700 text-lg font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🎮 Juegos y Retos de Aprendizaje</h1>
          <p className="text-slate-500 mt-1">Pon a prueba tus conocimientos con desafíos interactivos.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold">Puzzles: 12/50</span>
          <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold">Retos: 2/5</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {puzzles.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-hover flex flex-col">
            <div className={`h-32 flex items-center justify-center text-5xl bg-gradient-to-br ${
              p.type === 'Reto Semanal' ? 'from-amber-400 to-orange-500' : 'from-indigo-400 to-blue-500'
            }`}>
              {p.type === 'Reto Semanal' ? '🏆' : '🧩'}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  p.type === 'Reto Semanal' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {p.type}
                </span>
                <div className="flex gap-0.5" aria-label={`Dificultad: ${p.difficulty} de 5`}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < p.difficulty ? 'text-amber-500' : 'text-slate-200'}`} aria-hidden="true">★</span>
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{p.title}</h3>
              <p className="text-sm text-slate-500 mb-6">Resuelve este esquema para ganar recompensas únicas.</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">⭐ {p.xp} XP</span>
                <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all" aria-label={`Jugar ${p.title}`}>
                  Jugar
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty Slot / Coming Soon */}
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center opacity-60">
          <span className="text-4xl mb-3">🔒</span>
          <p className="text-sm font-bold text-slate-500">Próximamente</p>
          <p className="text-xs text-slate-400 mt-1">Nuevos retos cada lunes</p>
        </div>
      </div>
    </div>
  );
};
