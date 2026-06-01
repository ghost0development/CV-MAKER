import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobs } from '../api/client';
import { Briefcase, RefreshCw, ExternalLink, Loader2, Search, Target, DollarSign, Download, BarChart3, BookOpen, Layers } from 'lucide-react';

export default function JobDashboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [rescoreLoading, setRescoreLoading] = useState(false);
  const [sort, setSort] = useState('score');
  const [sourceFilter, setSourceFilter] = useState('');
  const [search, setSearch] = useState('');
  const [bestRoles, setBestRoles] = useState(null);
  const [profilesList, setProfilesList] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedSkills, setExpandedSkills] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const params = { sort: sort === 'score' ? undefined : sort };
      if (sourceFilter) params.source = sourceFilter;
      const [data, br, p, , s] = await Promise.all([
        jobs.list(params),
        jobs.bestRole().catch(() => null),
        jobs.profiles().catch(() => null),
        jobs.profiles().catch(() => []),
        jobs.stats().catch(() => null),
      ]);
      setList(data);
      if (br) setBestRoles(br);
      if (p) {
        if (p.profiles) { setProfilesList(Object.keys(p.profiles)); }
        else if (p.roles) setProfilesList(p.roles.map(r => r.role));
      }
      if (s) setStats(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sort, sourceFilter]);

  useEffect(() => { load(); }, [load]);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await jobs.scan();
      setScanResult(res);
      await load();
    } catch (e) {
      setScanResult({ error: e.response?.data?.error || e.message });
    } finally {
      setScanning(false);
    }
  };

  const handleRescore = async () => {
    setRescoreLoading(true);
    try {
      const res = await jobs.rescore();
      setScanResult({ rescored: res.rescores, profiles: res.marketProfiles });
      await load();
    } catch (e) {
      setScanResult({ error: e.message });
    } finally {
      setRescoreLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await jobs.exportCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'offers.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setScanResult({ error: `Export failed: ${e.message}` });
    }
  };

  const loadProfile = async (role) => {
    try {
      const p = await jobs.profile(role);
      setSelectedRole(p);
    } catch {}
  };

  const filtered = list.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase())
  );

  const st = stats || { total: list.length, byScore: {}, lastScan: null };
  const scoreStats = st.byScore || {};
  const sourcesUnique = [...new Set(filtered.map(j => j.source).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center glow">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">JobBoard</h1>
            <p className="text-xs text-gray-400">
              {st.total} ofert ·{" "}
              {st.lastScan ? `Ostatni skan: ${new Date(st.lastScan).toLocaleString('pl-PL')}` : 'Nie skanowano'}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => navigate('/job-match')} className="btn-ghost text-xs flex items-center gap-1">
            <Search size={13} /> Match
          </button>
          <button onClick={handleRescore} disabled={rescoreLoading} className="btn-ghost text-xs flex items-center gap-1">
            {rescoreLoading ? <Loader2 size={13} className="animate-spin" /> : <BarChart3 size={13} />}
            Rescore
          </button>
          <button onClick={handleExport} className="btn-ghost text-xs flex items-center gap-1">
            <Download size={13} /> CSV
          </button>
          <button onClick={() => setShowSidebar(!showSidebar)}
            className={`btn-ghost text-xs flex items-center gap-1 ${showSidebar ? 'text-primary-400 bg-primary-600/20' : ''}`}>
            <Layers size={13} /> Rynek
          </button>
          <button onClick={handleScan} disabled={scanning} className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5">
            {scanning ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {scanning ? 'Skanowanie...' : 'Skanuj'}
          </button>
        </div>
      </div>

      {/* SCAN PROGRESS */}
      {scanning && (
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-400 bg-primary-600/10 border border-primary-600/30 rounded-lg px-3 py-2">
          <Loader2 size={13} className="animate-spin text-primary-400" />
          <span>Skanowanie 15 źródeł ofert... Może potrwać do 60s</span>
          <div className="flex-1 max-w-[160px] h-1.5 bg-surface-200 rounded-full overflow-hidden ml-auto">
            <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* SCAN RESULT BANNER */}
      {scanResult && (
        <div className={`mb-3 px-3 py-2 rounded-lg text-xs border flex items-center justify-between ${
          scanResult.error ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-green-500/10 border-green-500/30 text-green-400'
        }`}>
          <span>
            {scanResult.error
              ? `Błąd: ${scanResult.error}`
              : scanResult.rescored
                ? `Przeliczono ${scanResult.rescored} ofert, zbudowano ${scanResult.profiles} profili rynkowych`
                : `Zeskanowano ${scanResult.scanned} ofert, +${scanResult.new} nowych (łącznie ${scanResult.total})`}
          </span>
          <button onClick={() => setScanResult(null)} className="text-gray-500 hover:text-gray-300 ml-2">✕</button>
        </div>
      )}

      {/* QUICK STATS */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <div className="card p-2.5 text-center">
          <p className="text-lg font-bold text-gray-100">{st.total}</p>
          <p className="text-[10px] text-gray-500">Wszystkie</p>
        </div>
        <div className="card p-2.5 text-center">
          <p className="text-lg font-bold text-green-400">{scoreStats.hot || 0}</p>
          <p className="text-[10px] text-gray-500">Hot ≥50%</p>
        </div>
        <div className="card p-2.5 text-center">
          <p className="text-lg font-bold text-amber-400">{scoreStats.warm || 0}</p>
          <p className="text-[10px] text-gray-500">Warm ≥25%</p>
        </div>
        <div className="card p-2.5 text-center">
          <p className="text-lg font-bold text-gray-400">{scoreStats.cold || 0}</p>
          <p className="text-[10px] text-gray-500">Cold 1-24%</p>
        </div>
        <div className="card p-2.5 text-center">
          <p className="text-lg font-bold text-gray-600">{scoreStats.zero || 0}</p>
          <p className="text-[10px] text-gray-500">Zero 0%</p>
        </div>
      </div>

      <div className="flex gap-4">
        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">

          {/* BEST ROLE MATCH CARDS */}
          {bestRoles && bestRoles.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Target size={14} className="text-primary-400" />
                <span className="text-sm font-semibold text-gray-300">Dopasowanie do rynku</span>
                <span className="text-[10px] text-gray-500">— najlepsze role dla Twojego CV</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {bestRoles.slice(0, 4).map((r, i) => {
                  const sal = r.salary || {};
                  const isTop = i === 0;
                  return (
                    <div key={r.role}
                      onClick={() => { loadProfile(r.role); setShowSidebar(true); }}
                      className={`card p-2.5 cursor-pointer glow-hover transition-all ${isTop ? 'ring-2 ring-primary-500 bg-primary-600/10' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold capitalize text-gray-200">{r.role}</span>
                        <span className={`text-xs font-bold ${isTop ? 'text-primary-400' : 'text-gray-400'}`}>
                          {r.marketCoverage}%
                        </span>
                      </div>
                      <div className="flex gap-2 text-[10px] text-gray-500 mb-1">
                        <span>{r.totalOffers} ofert</span>
                        {sal.medianMin && <span>{sal.medianMin.toLocaleString('pl-PL')}-{sal.medianMax.toLocaleString('pl-PL')} PLN</span>}
                      </div>
                      <div className="flex flex-wrap gap-0.5">
                        {r.topStrengths.slice(0, 2).map(s => (
                          <span key={s} className="text-[9px] bg-green-500/10 text-green-400 px-1 rounded">✓ {s}</span>
                        ))}
                        {r.missingCritical.slice(0, 1).map(s => (
                          <span key={s} className="text-[9px] bg-red-500/10 text-red-400 px-1 rounded">✗ {s}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FILTERS */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <div className="flex-1 relative min-w-[140px]">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Szukaj w tytule/firmie..."
                className="input-field text-xs py-1.5 pl-7 w-full" />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} className="input-field text-xs py-1.5 w-auto">
              <option value="score">Match</option>
              <option value="date">Data</option>
              <option value="salary">Zarobki</option>
            </select>
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="input-field text-xs py-1.5 w-auto max-w-[150px]">
              <option value="">Wszystkie źródła</option>
              {sourcesUnique.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* OFFERS */}
          {loading ? (
            <div className="text-center py-12"><Loader2 size={28} className="animate-spin mx-auto text-gray-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="card p-8 text-center">
              <Briefcase size={36} className="mx-auto text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">
                {search || sourceFilter ? 'Brak ofert spełniających kryteria' : 'Brak ofert. Kliknij "Skanuj"'}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map(job => {
                const bd = job.matchBreakdown || {};
                const breakdown = bd.breakdown || [];
                const showSkills = expandedSkills[job.id];
                const hasMarket = breakdown.length > 0;

                return (
                  <div key={job.id} className="card p-3 glow-hover transition-all">
                    <div className="flex items-start gap-3">
                      {/* SCORE */}
                      <div className="flex-shrink-0 w-10 text-center">
                        <div className={`text-sm font-bold ${
                          job.match_score >= 50 ? 'text-green-400'
                          : job.match_score >= 25 ? 'text-amber-400'
                          : job.match_score >= 1 ? 'text-gray-400'
                          : 'text-gray-600'
                        }`}>
                          {job.match_score != null ? `${job.match_score}%` : '?'}
                        </div>
                        {job.match_role && (
                          <div className="text-[8px] text-gray-500 mt-0.5 leading-tight">{job.match_role.split(' ').slice(0, 2).join(' ')}</div>
                        )}
                      </div>

                      {/* DETAILS */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-100 leading-tight">
                              <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                                {job.title}
                              </a>
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {[job.company, job.location].filter(Boolean).join(' · ')}
                              {job.posted_at && <span className="ml-1.5 text-gray-500">· {new Date(job.posted_at).toLocaleDateString('pl-PL')}</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                            {job.source && <span className="text-[10px] text-gray-500 bg-surface-200 px-1.5 py-0.5 rounded">{job.source}</span>}
                          </div>
                        </div>

                        {job.salary_min != null && (
                          <p className="text-xs font-semibold text-green-400 mt-1">
                            <DollarSign size={11} className="inline -ml-0.5" />
                            {job.salary_min.toLocaleString('pl-PL')}{job.salary_max ? ` - ${job.salary_max.toLocaleString('pl-PL')}` : ''} {job.currency || 'PLN'}
                          </p>
                        )}

                        {/* SKILLS BREAKDOWN TOGGLE */}
                        {hasMarket && (
                          <div className="mt-1.5">
                            <button onClick={() => setExpandedSkills({...expandedSkills, [job.id]: !showSkills})}
                              className="text-[10px] text-primary-400 hover:text-primary-300 flex items-center gap-1">
                              <BarChart3 size={10} />
                              {showSkills ? 'Ukryj dopasowanie' : `Pokaż dopasowanie (${breakdown.length} skilli)`}
                            </button>
                            {showSkills && (
                              <div className="mt-1.5 flex flex-wrap gap-0.5">
                                {breakdown.slice(0, 50).map(b => (
                                  <span key={b.skill} className={`text-[9px] px-1 py-0.5 rounded font-medium ${
                                    b.status === 'matched'
                                      ? 'bg-green-500/10 text-green-400'
                                      : b.status === 'partial'
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {b.status === 'matched' ? '✓' : b.status === 'partial' ? '~' : '✗'} {b.skill}
                                    {b.userLevel > 0 ? ` ${b.userLevel}/${b.requiredLevel || '?'}` : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {job.url && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer"
                            className="btn-ghost text-[10px] py-1 px-1.5 flex items-center gap-0.5">
                            <ExternalLink size={10} /> Open
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDEBAR: MARKET PROFILES */}
        {showSidebar && (
          <div className="w-72 flex-shrink-0">
            <div className="card p-3 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-200">Profile rynkowe</h3>
                <button onClick={() => { setShowSidebar(false); setSelectedRole(null); }}
                  className="text-[10px] text-gray-500 hover:text-gray-300">✕</button>
              </div>

              {/* ROLE NAV */}
              <div className="flex flex-wrap gap-1 mb-3">
                {profilesList.map(role => (
                  <button key={role} onClick={() => loadProfile(role)}
                    className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                      selectedRole?.role === role
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-200 text-gray-400 hover:bg-surface-300'
                    }`}>
                    {role.replace(' engineer', '').replace(' developer', '')}
                  </button>
                ))}
              </div>

              {/* SELECTED ROLE DETAIL */}
              {selectedRole && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold capitalize text-gray-200">{selectedRole.role}</span>
                    <span className="text-xs font-bold text-primary-400">{selectedRole.marketFit?.marketCoverage || 0}%</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-3">
                    {selectedRole.marketFit?.totalOffers || 0} ofert w bazie
                    {selectedRole.salary?.medianMin && (
                      <span> · {selectedRole.salary.medianMin.toLocaleString('pl-PL')}-{selectedRole.salary.medianMax.toLocaleString('pl-PL')} PLN</span>
                    )}
                  </div>

                  <h4 className="text-[10px] font-semibold text-gray-400 mb-1 flex items-center gap-1">
                    <BookOpen size={10} /> Learning priority
                  </h4>
                  <div className="space-y-1 mb-3">
                    {(selectedRole.learningPriority || []).slice(0, 5).map(p => (
                      <div key={p.skill} className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-300">{p.skill}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-gray-500">{p.userLevel}→{p.expectedLevel}</span>
                          <div className="w-12 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, p.marketFreq * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h4 className="text-[10px] font-semibold text-gray-400 mb-1 flex items-center gap-1">
                    <Target size={10} /> Top match
                  </h4>
                  <div className="flex flex-wrap gap-0.5 mb-2">
                    {selectedRole.topStrengths?.slice(0, 3).map(s => (
                      <span key={s} className="text-[9px] bg-green-500/10 text-green-400 px-1 rounded">✓ {s}</span>
                    ))}
                    {selectedRole.missingCritical?.slice(0, 3).map(s => (
                      <span key={s} className="text-[9px] bg-red-500/10 text-red-400 px-1 rounded">✗ {s}</span>
                    ))}
                  </div>
                </div>
              )}

              {!selectedRole && (
                <p className="text-[10px] text-gray-500">Kliknij rolę, by zobaczyć szczegóły dopasowania i priorytety nauki</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
