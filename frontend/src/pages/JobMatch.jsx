import { useState } from 'react';
import { jobs } from '../api/client';
import { Briefcase, Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react';

function MatchResult({ result }) {
  const m = result.match;
  const color = m >= 80 ? 'text-green-600' : m >= 60 ? 'text-yellow-600' : 'text-red-600';
  const barColor = m >= 80 ? 'bg-green-500' : m >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const ringColor = m >= 80 ? 'border-green-400' : m >= 60 ? 'border-yellow-400' : 'border-red-400';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 flex-wrap">
        <div className={`w-28 h-28 rounded-full border-4 ${ringColor} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-3xl font-bold ${color}`}>{m}%</span>
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-lg font-semibold text-gray-900">Match: {result.detectedRole || 'Nie określono'}</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div className={`${barColor} h-3 rounded-full transition-all`} style={{ width: `${m}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>Skills: {result.roleMatch}%</span>
            {result.marketPosition && <span>Rynek: {result.marketPosition}%</span>}
          </div>
        </div>
      </div>

      {result.benchmark && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm">
          <div className="flex items-center gap-2 mb-2">
            {result.benchmark.position === 'top' ? <TrendingUp size={18} className="text-green-600" /> :
             result.benchmark.position === 'bottom' ? <TrendingDown size={18} className="text-red-600" /> :
             <AlertTriangle size={18} className="text-yellow-600" />}
            <span className="font-semibold text-indigo-900">Pozycja rynkowa</span>
          </div>
          <p className="text-indigo-800">
            Twoje CV: <strong>{result.benchmark.userAvgSkill}/10</strong> średnia umiejętności ·
            Rynek ({result.benchmark.role}): <strong>{result.benchmark.benchAvgSkill}/10</strong>
          </p>
          <p className="text-indigo-700 mt-1">
            Jesteś w <strong>{result.marketPosition}%</strong> najlepszych kandydatów dla tej roli.
          </p>
          {result.benchmark.skillComparison.slice(0, 5).map((s, i) => (
            <div key={i} className="flex items-center gap-2 mt-1 text-xs">
              <span className="w-28 text-indigo-800 truncate">{s.skill}</span>
              <div className="flex-1 bg-indigo-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(s.userLevel / 10) * 100}%` }} />
              </div>
              <span className="w-16 text-right text-indigo-600">{s.userLevel}/10</span>
              <span className="text-indigo-400">vs</span>
              <div className="flex-1 bg-indigo-200 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${(s.benchLevel / 10) * 100}%` }} />
              </div>
              <span className="w-16 text-right text-purple-600">{s.benchLevel}/10</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-800 mb-2">Umiejętności w ofercie</h3>
        <div className="space-y-1.5">
          {result.breakdown.filter(b => b.status === 'matched').map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
              <span className="flex-1">{b.skill}</span>
              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(b.userLevel / 10) * 100}%` }} />
              </div>
              <span className="text-gray-500 w-8 text-right">{b.userLevel}/10</span>
            </div>
          ))}
          {result.missing.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <XCircle size={14} className="text-red-400 flex-shrink-0" />
              <span className="flex-1 text-gray-400">{b.skill}</span>
              <span className="text-xs text-red-400">brak</span>
            </div>
          ))}
        </div>
      </div>

      {result.requirements?.length > 0 && (
        <div className="text-sm">
          <h3 className="font-semibold text-gray-800 mb-1">Wymagania w ofercie</h3>
          <div className="flex flex-wrap gap-2">
            {result.requirements.map((r, i) => (
              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{r}</span>
            ))}
          </div>
        </div>
      )}

      {result.yearsRequired && (
        <p className="text-sm text-gray-500">Wymagane doświadczenie: {result.yearsRequired}+ lat</p>
      )}
    </div>
  );
}

export default function JobMatch() {
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!url && !desc) { setError('Podaj URL oferty lub wklej opis'); return; }
    setLoading(true);
    try {
      const res = url
        ? await jobs.match({ url })
        : await jobs.match({ description: desc.slice(0, 10000) });
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Błąd połączenia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase size={28} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">JobMatch</h1>
      </div>

      <div className="card p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL oferty</label>
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); if (e.target.value) setDesc(''); }}
              placeholder="https://justjoin.it/... lub inne"
              className="input w-full"
            />
          </div>
          <div className="text-center text-sm text-gray-400">— lub —</div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wklej opis oferty</label>
            <textarea
              value={desc}
              onChange={e => { setDesc(e.target.value); if (e.target.value) setUrl(''); }}
              placeholder="Wklej treść ogłoszenia..."
              rows={6}
              className="input w-full resize-none"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {loading ? 'Skanuję ofertę...' : 'Sprawdź match'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {result && (
        <div className="card p-6">
          <MatchResult result={result} />
        </div>
      )}
    </div>
  );
}
