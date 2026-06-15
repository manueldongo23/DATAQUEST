import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Lock, ArrowRight, Star, Trophy, ChevronRight, FlaskConical, Swords, GraduationCap, Lightbulb } from 'lucide-react';
import axiosInstance from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from './Toast';

interface NFStep {
  nf: string;
  name: string;
  description: string;
  progress: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
}

interface AcademyData {
  learning_path: NFStep[];
  current_step: number;
  total_steps: number;
  completed_steps: number;
}

const nfIcons: Record<string, React.ReactNode> = {
  'DF': <FlaskConical className="w-5 h-5" />,
  '1FN': <BookOpen className="w-5 h-5" />,
  '2FN': <BookOpen className="w-5 h-5" />,
  '3FN': <BookOpen className="w-5 h-5" />,
  'BCNF': <Swords className="w-5 h-5" />,
  '4FN': <GraduationCap className="w-5 h-5" />,
  '5FN': <Trophy className="w-5 h-5" />,
};

const statusColors: Record<string, string> = {
  locked: 'border-slate-700/50 bg-slate-800/30 opacity-50',
  available: 'border-indigo-500/30 bg-slate-800/50 hover:border-indigo-500/60',
  in_progress: 'border-cyan-500/40 bg-slate-800/60 hover:border-cyan-500/60',
  completed: 'border-emerald-500/30 bg-emerald-900/10 hover:border-emerald-500/50',
};

const statusIcons: Record<string, React.ReactNode> = {
  locked: <Lock className="w-4 h-4 text-slate-600" />,
  available: <ArrowRight className="w-4 h-4 text-indigo-400" />,
  in_progress: <Lightbulb className="w-4 h-4 text-cyan-400 animate-pulse" />,
  completed: <CheckCircle className="w-4 h-4 text-emerald-400" />,
};

export const AcademyView: React.FC = () => {
  const [academyData, setAcademyData] = useState<AcademyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNF, setSelectedNF] = useState<string | null>(null);
  const [nfExplanation, setNfExplanation] = useState<any>(null);

  useEffect(() => {
    loadAcademy();
  }, []);

  const loadAcademy = async () => {
    try {
      const [progressRes] = await Promise.all([
        axiosInstance.get('/progress/learning-path'),
        axiosInstance.get('/academy'),
      ]);
      if (progressRes.data.success) {
        setAcademyData(progressRes.data.data);
      }
    } catch (err: any) {
      toast.error('Error al cargar la academia');
    } finally {
      setLoading(false);
    }
  };

  const loadExplanation = async (nf: string) => {
    setSelectedNF(nf);
    setNfExplanation(null);
    try {
      const res = await axiosInstance.get(`/academy/explain/${nf}`);
      if (res.data.success) {
        setNfExplanation(res.data.data);
      }
    } catch {
      toast.error('Error al cargar la explicación');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
        <LoadingSpinner text="Cargando academia..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-8 mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Academia DataQuest</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Aprende normalización de bases de datos paso a paso. Cada forma normal tiene explicación, ejemplos y ejercicios prácticos.
        </p>
        {academyData && (
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
            <span>{academyData.completed_steps}/{academyData.total_steps} formas completadas</span>
            <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={academyData.completed_steps} aria-valuemin={0} aria-valuemax={academyData.total_steps} aria-label="Progreso total de aprendizaje">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all"
                style={{ width: `${(academyData.completed_steps / academyData.total_steps) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Path */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              Ruta de Aprendizaje
            </h2>
            <div className="space-y-2">
              {academyData?.learning_path.map((step) => (
                <button
                  key={step.nf}
                  onClick={() => step.status !== 'locked' && loadExplanation(step.nf)}
                  disabled={step.status === 'locked'}
                  aria-label={step.status === 'locked' ? `${step.name} - Bloqueado` : `Ver ${step.name}`}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${statusColors[step.status]}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center" aria-hidden="true">
                    {nfIcons[step.nf]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{step.name}</span>
                      {statusIcons[step.status]}
                    </div>
                    <div className="w-full h-1 bg-slate-700 rounded-full mt-1 overflow-hidden" role="progressbar" aria-valuenow={step.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso en ${step.name}`}>
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                  {step.status !== 'locked' && <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Explanation Panel */}
        <div className="lg:col-span-2">
          {selectedNF && nfExplanation ? (
            <div className="glass rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  {nfIcons[selectedNF]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{nfExplanation.title}</h2>
                  <p className="text-slate-400 text-sm">{nfExplanation.description}</p>
                </div>
              </div>

              {/* Rules */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Reglas</h3>
                <div className="space-y-2">
                  {nfExplanation.rules?.map((rule: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/40">
                      <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Before/After Example */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {nfExplanation.before_example && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">❌ Incorrecto</h3>
                    <pre className="text-xs text-red-300 bg-red-900/10 rounded-xl p-4 overflow-x-auto border border-red-900/20">{nfExplanation.before_example}</pre>
                  </div>
                )}
                {nfExplanation.after_example && (
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2">✅ Normalizado</h3>
                    <pre className="text-xs text-emerald-300 bg-emerald-900/10 rounded-xl p-4 overflow-x-auto border border-emerald-900/20">{nfExplanation.after_example}</pre>
                  </div>
                )}
              </div>

              {/* Common Mistakes */}
              {nfExplanation.common_mistakes && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">⚠️ Errores Comunes</h3>
                  <div className="space-y-1">
                    {nfExplanation.common_mistakes.map((mistake: string, i: number) => (
                      <p key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-yellow-500">•</span> {mistake}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise Button */}
              <button
                onClick={async () => {
                  try {
                    const res = await axiosInstance.get(`/academy/exercise?nf=${selectedNF}`);
                    if (res.data.success) {
                      toast.success(`Ejercicio: ${res.data.data.title}`);
                    }
                  } catch {
                    toast.error('Error al cargar ejercicio');
                  }
                }}
                className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all btn-primary"
              >
                <Swords className="w-4 h-4" aria-hidden="true" />
                Practicar {selectedNF}
              </button>
              <div aria-live="polite" aria-atomic="true" className="sr-only">
                {nfExplanation ? `Explicación de ${selectedNF} cargada` : ''}
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <GraduationCap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Selecciona una forma normal</h3>
              <p className="text-slate-500 text-sm">
                Elige un tema de la ruta de aprendizaje para ver su explicación, ejemplos y ejercicios.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
