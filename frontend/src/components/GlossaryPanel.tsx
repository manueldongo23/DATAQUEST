import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, BookOpen, Filter } from 'lucide-react';
import axiosInstance from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';
import { useLocaleStore } from '../store/localeStore';

interface GlossaryTerm {
  name: string;
  short: string;
  definition: string;
  example: string;
  analogy: string;
  symbol: string;
  related_terms: string[];
  difficulty: string;
}

const difficultyLabels: Record<string, Record<string, string>> = {
  es: { basic: 'Básico', intermediate: 'Intermedio', advanced: 'Avanzado', all: 'Todos' },
  en: { basic: 'Basic', intermediate: 'Intermediate', advanced: 'Advanced', all: 'All' },
  'pt-BR': { basic: 'Básico', intermediate: 'Intermediário', advanced: 'Avançado', all: 'Todos' },
};

const difficultyColors: Record<string, string> = {
  basic: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  advanced: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export const GlossaryPanel: React.FC = () => {
  const [terms, setTerms] = useState<Record<string, GlossaryTerm>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const { locale } = useLocaleStore();

  useEffect(() => {
    loadTerms();
  }, [locale]);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/glossary', {
        headers: { 'X-Locale': locale },
      });
      if (res.data.success) {
        setTerms(res.data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const filteredTerms = useMemo(() => {
    let entries = Object.entries(terms);

    if (difficultyFilter !== 'all') {
      entries = entries.filter(([, term]) => term.difficulty === difficultyFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      entries = entries.filter(([, term]) =>
        term.name.toLowerCase().includes(q) ||
        term.short.toLowerCase().includes(q) ||
        term.definition.toLowerCase().includes(q)
      );
    }

    return entries;
  }, [terms, search, difficultyFilter]);

  const labels = difficultyLabels[locale] || difficultyLabels.es;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Cargando glosario..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-8 mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Glosario de Base de Datos</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Consulta términos, definiciones, ejemplos y analogías sobre normalización de bases de datos.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar términos..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div className="flex gap-1">
              {(['all', 'basic', 'intermediate', 'advanced'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    difficultyFilter === d
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'text-slate-500 border-slate-700/30 hover:border-slate-600/50 hover:text-slate-300'
                  }`}
                >
                  {labels[d]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredTerms.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Sin resultados</h3>
          <p className="text-slate-500 text-sm">
            No se encontraron términos que coincidan con tu búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTerms.map(([key, term]) => {
            const isExpanded = expanded === key;
            return (
              <div
                key={key}
                className={`glass rounded-2xl border transition-all duration-300 ${
                  isExpanded
                    ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                    : 'border-slate-700/30 hover:border-slate-600/50'
                }`}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : key)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    difficultyColors[term.difficulty] || 'bg-slate-800 text-slate-400'
                  }`}>
                    <span className="text-xs font-bold">{term.short}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm">{term.name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">
                      {term.definition}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                      difficultyColors[term.difficulty]
                    }`}>
                      {labels[term.difficulty]}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 animate-slide-down space-y-4 border-t border-slate-700/30">
                    {/* Definition */}
                    <div className="pt-4">
                      <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Definición</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">{term.definition}</p>
                    </div>

                    {/* Symbol */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Notación:</span>
                      <code className="px-3 py-1 bg-slate-800/60 rounded-lg text-sm text-cyan-300 font-mono">{term.symbol}</code>
                    </div>

                    {/* Example */}
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Ejemplo</h4>
                      <pre className="text-sm text-emerald-300 bg-emerald-900/10 rounded-xl p-4 border border-emerald-900/20 whitespace-pre-wrap font-mono">{term.example}</pre>
                    </div>

                    {/* Analogy */}
                    <div>
                      <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Analogía</h4>
                      <p className="text-sm text-slate-300 bg-amber-900/10 rounded-xl p-4 border border-amber-900/20 leading-relaxed">
                        {term.analogy}
                      </p>
                    </div>

                    {/* Related Terms */}
                    {term.related_terms.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Términos Relacionados</h4>
                        <div className="flex flex-wrap gap-2">
                          {term.related_terms.map((rt) => (
                            <span
                              key={rt}
                              className="px-3 py-1 bg-slate-800/60 rounded-full text-xs text-slate-300 border border-slate-700/30"
                            >
                              {rt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
