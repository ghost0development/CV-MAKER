import { FileText, Zap, Palette, Download, ArrowRight, Check, Star, Users, ChevronDown, Sparkles } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-gray-950" />
            </div>
            <span className="text-lg font-bold tracking-tight">CVcraft</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollTo('templates')} className="hover:text-white transition-colors">Templates</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Pricing</button>
          </div>
          <button
            onClick={onGetStarted}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-lg font-semibold text-sm transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />
        </div>

        <div className="relative text-center max-w-3xl mx-auto">
          <div className="slide-up inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-powered. Free. No sign-up required.
          </div>
          <h1 className="slide-up-delay-1 text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
            Build your CV<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">in minutes</span>, not hours.
          </h1>
          <p className="slide-up-delay-2 text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Professional resume builder with beautiful templates and AI assistance. No account needed - just start building.
          </p>
          <div className="slide-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollTo('templates')}
              className="inline-flex items-center gap-2 px-8 py-4 border border-gray-700 hover:border-gray-500 rounded-xl font-semibold text-gray-300 hover:text-white text-lg transition-all"
            >
              See Templates
            </button>
          </div>

          <div className="slide-up-delay-3 mt-14 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>2,400+ resumes created</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1">4.9</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => scrollTo('features')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 hover:text-gray-400 transition-colors animate-bounce"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto">From filling in your details to downloading a polished PDF, we've got you covered.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'AI Assistant',
                desc: 'Generate summaries, enhance descriptions, and get skill suggestions powered by AI.',
              },
              {
                icon: <Palette className="w-6 h-6" />,
                title: 'Beautiful Templates',
                desc: 'Multiple professional templates designed by experts. Free and Pro options to match your style.',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Lightning Fast',
                desc: 'Fill sections, preview live, and export. Your CV ready in under 5 minutes.',
              },
              {
                icon: <Download className="w-6 h-6" />,
                title: 'PDF Export',
                desc: 'Download pixel-perfect PDFs. ATS-friendly formatting built in from the start.',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Auto-Save',
                desc: 'Your work is saved automatically as you type. Never lose progress again.',
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: 'ATS Optimized',
                desc: 'Templates designed to pass Applicant Tracking Systems used by major employers.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-gray-900/50 border border-gray-800/50 rounded-2xl p-7 hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section id="templates" className="py-28 px-6 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Professional templates</h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto">Choose from free and premium templates, all designed to make you stand out.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Modern', pro: false, desc: 'Clean and contemporary', color: 'from-emerald-500/20 to-teal-500/20' },
              { name: 'Classic', pro: false, desc: 'Timeless and elegant', color: 'from-blue-500/20 to-cyan-500/20' },
              { name: 'Executive', pro: true, desc: 'Two-column, bold sidebar', color: 'from-amber-500/20 to-orange-500/20' },
              { name: 'Minimal', pro: true, desc: 'Ultra-clean, refined', color: 'from-rose-500/20 to-pink-500/20' },
            ].map((tpl) => (
              <div key={tpl.name} className="group relative">
                <div className={`aspect-[3/4] bg-gradient-to-br ${tpl.color} border border-gray-800/50 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-emerald-500/30 transition-all duration-300`}>
                  <div className="w-full bg-white/10 rounded-lg p-3 space-y-2">
                    <div className="w-3/4 h-2 bg-white/20 rounded" />
                    <div className="w-1/2 h-1.5 bg-white/10 rounded" />
                    <div className="space-y-1.5 mt-3">
                      <div className="w-full h-1 bg-white/10 rounded" />
                      <div className="w-5/6 h-1 bg-white/10 rounded" />
                      <div className="w-4/6 h-1 bg-white/10 rounded" />
                    </div>
                    <div className="space-y-1.5 mt-3">
                      <div className="w-full h-1 bg-white/10 rounded" />
                      <div className="w-3/4 h-1 bg-white/10 rounded" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{tpl.name}</h3>
                    <p className="text-xs text-gray-500">{tpl.desc}</p>
                  </div>
                  {tpl.pro && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">PRO</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400 text-lg">Three steps to your perfect CV.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Fill in your details', desc: 'Add your experience, education, skills, and more through our intuitive editor.' },
              { step: '2', title: 'Let AI polish it', desc: 'Use AI to generate summaries, enhance descriptions, and suggest relevant skills.' },
              { step: '3', title: 'Download PDF', desc: 'Pick a template and export your polished CV as a PDF, ready to send.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-lg mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 px-6 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple pricing</h2>
            <p className="text-gray-400 text-lg">No subscriptions. No hidden fees. Pay once, use forever.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-lg font-semibold mb-1">Free</h3>
              <p className="text-gray-400 text-sm mb-5">Everything you need to get started</p>
              <div className="text-4xl font-extrabold mb-6">
                $0<span className="text-base font-normal text-gray-500">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['1 resume', '2 free templates', 'AI assistant', 'PDF export', 'Auto-save'].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />{t}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-3.5 border border-gray-700 hover:border-gray-500 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
              >
                Get Started Free
              </button>
            </div>

            <div className="bg-gray-900/80 border-2 border-emerald-500/30 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500 text-gray-950 text-xs font-bold rounded-full">
                POPULAR
              </div>
              <h3 className="text-lg font-semibold mb-1">Pro</h3>
              <p className="text-gray-400 text-sm mb-5">For serious job seekers</p>
              <div className="text-4xl font-extrabold mb-6">
                $9<span className="text-base font-normal text-gray-500">/one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited resumes', 'All templates (4+)', 'AI assistant', 'Custom colors', 'Priority support', 'ATS-friendly format'].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />{t}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl font-bold text-sm transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to build your CV?</h2>
          <p className="text-gray-400 text-lg mb-8">Join thousands of professionals who've already created their resumes with CVcraft.</p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-950" />
            </div>
            <span className="font-bold">CVcraft</span>
          </div>
          <p className="text-gray-500 text-sm">Built for people who want to ship fast.</p>
        </div>
      </footer>
    </div>
  );
}
