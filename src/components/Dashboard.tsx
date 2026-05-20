import { FileText, Plus, Trash2, Clock, Crown, ArrowRight } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useResumes, createEmptyResume, type Resume } from '../hooks/useResumes';

interface DashboardProps {
  onEditResume: (resume: Resume) => void;
  onBack: () => void;
}

export function Dashboard({ onEditResume, onBack }: DashboardProps) {
  const { profile } = useProfile();
  const { resumes, loading, saveResume, deleteResume } = useResumes();

  const isPro = profile?.plan === 'pro';
  const isFreeLimit = !isPro && resumes.length >= 1;

  const handleCreate = async () => {
    if (isFreeLimit) return;
    const newResume = createEmptyResume();
    const saved = await saveResume(newResume);
    if (saved) onEditResume(saved);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this resume?')) return;
    await deleteResume(id);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-gray-950" />
            </div>
            <span className="text-lg font-bold tracking-tight">CVcraft</span>
          </div>
          <div className="flex items-center gap-4">
            {isPro && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
                <Crown className="w-3.5 h-3.5" /> PRO
              </span>
            )}
            <button
              onClick={onBack}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Your Resumes</h1>
          <p className="text-gray-400 text-lg">
            {isPro ? 'Create unlimited resumes with all templates' : `${resumes.length}/1 resume on the free plan`}
          </p>
        </div>

        <div className="mb-8">
          <button
            onClick={handleCreate}
            disabled={isFreeLimit || loading}
            className={`group inline-flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-sm transition-all ${
              isFreeLimit
                ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-800'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isFreeLimit ? 'bg-gray-800' : 'bg-emerald-500/20 group-hover:bg-emerald-500/30'
            }`}>
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div>Create New Resume</div>
              <div className={`text-xs font-normal ${isFreeLimit ? 'text-gray-600' : 'text-emerald-500/70'}`}>
                {isFreeLimit ? 'Upgrade to Pro for unlimited' : 'Start from scratch'}
              </div>
            </div>
            {!isFreeLimit && <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 border border-gray-800/50 rounded-2xl bg-gray-900/20">
            <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 mb-2 text-lg">No resumes yet</p>
            <p className="text-gray-600 text-sm mb-6">Create your first resume and land that dream job.</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Resume
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((r) => (
              <div
                key={r.id}
                onClick={() => onEditResume(r)}
                className="group bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 cursor-pointer hover:border-emerald-500/30 hover:bg-gray-900/80 transition-all duration-300"
              >
                <div className="aspect-[3/4] bg-white/5 rounded-xl mb-4 p-3 overflow-hidden">
                  <div className="space-y-1.5">
                    <div className="w-3/4 h-1.5 bg-white/15 rounded" />
                    <div className="w-1/2 h-1 bg-white/8 rounded" />
                    <div className="mt-3 space-y-1">
                      <div className="w-full h-0.5 bg-white/8 rounded" />
                      <div className="w-5/6 h-0.5 bg-white/8 rounded" />
                      <div className="w-4/6 h-0.5 bg-white/8 rounded" />
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="w-full h-0.5 bg-white/8 rounded" />
                      <div className="w-3/4 h-0.5 bg-white/8 rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold truncate">{r.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(r.updated_at)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, r.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-600 capitalize">{r.template} template</div>
              </div>
            ))}
          </div>
        )}

        {!isPro && resumes.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/15 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> Upgrade to Pro
              </h3>
              <p className="text-sm text-gray-400 mt-1">Unlimited resumes, all templates, custom colors</p>
            </div>
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
              $9 one-time
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-600 text-sm">
          CVcraft &mdash; Built for people who want to ship fast.
        </div>
      </footer>
    </div>
  );
}
