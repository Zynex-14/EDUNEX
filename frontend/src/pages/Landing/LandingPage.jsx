import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#for-students', label: 'Students' },
  { href: '#for-colleges', label: 'Colleges' },
  { href: '#for-industry', label: 'Industry' },
];

const FEATURES = [
  { icon: '⚡', title: 'Skill Gap Engine', desc: 'Real-time calculation of your industry readiness score based on live database data.', color: 'var(--color-primary)' },
  { icon: '🎓', title: 'Course Recommendations', desc: 'Automatically matched courses for your exact missing skills from top companies.', color: 'var(--cyan-500)' },
  { icon: '💼', title: 'Smart Job Matching', desc: 'Jobs and internships ranked by your personal skill match percentage.', color: 'var(--color-success)' },
  { icon: '📊', title: 'Curriculum Analytics', desc: 'Colleges discover which skills are missing from their departments in real-time.', color: 'var(--color-warning)' },
  { icon: '🔍', title: 'Talent Discovery', desc: 'Companies search and find students by skill, department, CGPA and readiness.', color: 'var(--color-danger)' },
  { icon: '🔔', title: 'Live Notifications', desc: 'Real-time updates on applications, opportunities, and skill alerts.', color: '#a78bfa' },
];

const STEPS = [
  { step: '01', role: 'Industry', action: 'Defines required skills and posts jobs', icon: '🏢', color: '#10b981' },
  { step: '02', role: 'Platform', action: 'Calculates skill gaps and generates recommendations', icon: '⬡', color: '#8b5cf6' },
  { step: '03', role: 'Student', action: 'Views gaps, takes recommended courses, applies to jobs', icon: '👤', color: '#06b6d4' },
  { step: '04', role: 'College', action: 'Improves curriculum based on industry demand data', icon: '🏛️', color: '#f59e0b' },
];

export default function LandingPage() {
  const [stats, setStats] = useState({ students: 12450, colleges: 450, companies: 850, active_jobs: 3200 });
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.scroll-reveal');
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ── Navbar ── */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 400, 
        height: 64, display: 'flex', alignItems: 'center',
        background: scrolled || mobileMenuOpen ? 'var(--bg-nav)' : 'transparent',
        backdropFilter: scrolled || mobileMenuOpen ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled || mobileMenuOpen ? 'var(--border-subtle)' : 'rgba(255, 255, 255, 0.05)'}`,
        transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1280, margin: '0 auto', padding: '0 var(--space-4)' }}>
          {/* Logo & Brand */}
          <Link to="/" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none' }}>
            <img src={logo} alt="Logo" style={{ width: 36, height: 36, background: '#fff', borderRadius: 'var(--radius-md)', padding: '2px', objectFit: 'contain' }} />
            <span className="text-gradient" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem' }}>EduNex</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{ padding: '0.45rem 0.875rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.color = 'var(--text-primary)'; e.target.style.background = 'var(--bg-glass)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; e.target.style.background = 'transparent'; }}>
                {l.label}
              </a>
            ))}
            <button onClick={toggleTheme} aria-label="Toggle theme" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 8 }}>
                <Link to={`/${user.role}/dashboard`} className="btn btn-primary btn-sm">Dashboard</Link>
                <button onClick={logout} className="btn btn-outline btn-sm">Sign Out</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }}>Sign In</Link>
                <Link to="/signup/student" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Theme + Hamburger Toggle */}
          <div className="mobile-nav-toggle" style={{ display: 'none', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button onClick={toggleTheme} aria-label="Toggle theme" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '1.1rem', padding: '0.4rem 0.6rem' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="Toggle mobile menu"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '1.4rem',
                lineHeight: 1,
                padding: '0.4rem 0.7rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Drawer ── */}
      {mobileMenuOpen && (
        <div 
          className="animate-slide-up"
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-overlay)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            zIndex: 399,
            padding: 'var(--space-6) var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={closeMobileMenu}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{l.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </a>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border-subtle)', margin: 'var(--space-2) 0' }} />

          {/* Mobile Auth Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {user ? (
              <>
                <Link to={`/${user.role}/dashboard`} onClick={closeMobileMenu} className="btn btn-primary btn-lg btn-full">
                  Go to Dashboard
                </Link>
                <button onClick={() => { logout(); closeMobileMenu(); }} className="btn btn-secondary btn-lg btn-full">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobileMenu} className="btn btn-secondary btn-lg btn-full">
                  Sign In
                </Link>
                <Link to="/signup/student" onClick={closeMobileMenu} className="btn btn-primary btn-lg btn-full">
                  🎓 Get Started as Student
                </Link>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                  <Link to="/signup/college" onClick={closeMobileMenu} className="btn btn-secondary btn-sm btn-full" style={{ fontSize: '0.82rem' }}>
                    🏛️ For Colleges
                  </Link>
                  <Link to="/signup/industry" onClick={closeMobileMenu} className="btn btn-secondary btn-sm btn-full" style={{ fontSize: '0.82rem' }}>
                    🏢 For Industry
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', background: 'var(--gradient-hero)', paddingTop: 88, paddingBottom: 48, overflow: 'hidden' }}>
        {/* Glows */}
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="animate-slide-up">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.1rem, 6.5vw, 4.8rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 'var(--space-5)', letterSpacing: '-0.02em' }}>
              Bridge the Gap Between
              <br />
              <span className="text-gradient">Talent, Education</span>
              <br />
              <span style={{ color: 'var(--text-primary)' }}>& Industry.</span>
            </h1>

            <p style={{ fontSize: 'clamp(0.95rem, 2.8vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: 620, margin: '0 auto var(--space-8)', lineHeight: 1.7, padding: '0 var(--space-2)' }}>
              Discover the skills industries need, identify skill gaps, improve curriculum, and connect talent with real opportunities.
            </p>

            {/* CTA Buttons */}
            <div className="landing-hero-cta" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-12)', maxWidth: 540, margin: '0 auto var(--space-12)' }}>
              {user ? (
                <>
                  <Link to={`/${user.role}/dashboard`} className="btn btn-primary btn-xl">
                    Go to Dashboard
                  </Link>
                  <button onClick={logout} className="btn btn-secondary btn-xl">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup/student" className="btn btn-primary btn-xl" style={{ minWidth: 160 }}>
                    🎓 I'm a Student
                  </Link>
                  <Link to="/signup/college" className="btn btn-secondary btn-xl" style={{ minWidth: 160 }}>
                    🏛️ I'm a College
                  </Link>
                  <Link to="/signup/industry" className="btn btn-outline btn-xl" style={{ minWidth: 160 }}>
                    🏢 I'm a Company
                  </Link>
                </>
              )}
            </div>

            {/* Ecosystem Visual */}
            <div className="scroll-reveal delay-1 ecosystem-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-10)' }}>
              {[
                { label: 'STUDENT', icon: '👤', color: '#06b6d4' },
                { label: '↔', icon: null, color: 'var(--text-faint)', isArrow: true },
                { label: 'PLATFORM', icon: '⬡', color: '#8b5cf6' },
                { label: '↔', icon: null, color: 'var(--text-faint)', isArrow: true },
                { label: 'COLLEGE', icon: '🏛️', color: '#f59e0b' },
                { label: '↔', icon: null, color: 'var(--text-faint)', isArrow: true },
                { label: 'INDUSTRY', icon: '🏢', color: '#10b981' },
              ].map((item, i) => item.isArrow ? (
                <span key={i} className="ecosystem-arrow" style={{ color: 'var(--text-faint)', fontSize: '1.4rem', fontWeight: 300 }}>↔</span>
              ) : (
                <div key={i} className="ecosystem-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 56, height: 56, background: `${item.color}18`, border: `2px solid ${item.color}40`, borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: `0 0 20px ${item.color}20` }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: item.color }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Platform Stats */}
            <div className="landing-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)', maxWidth: 860, margin: '0 auto' }}>
              {[
                { value: stats.students || '0', label: 'Students' },
                { value: stats.colleges || '0', label: 'Colleges' },
                { value: stats.companies || '0', label: 'Companies' },
                { value: stats.active_jobs || '0', label: 'Active Jobs' },
              ].map((s, i) => (
                <div key={i} className={`scroll-reveal delay-${i + 1}`} style={{ textAlign: 'center', background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-2)' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-display)' }} className="text-gradient">{s.value}+</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Skill Gap Problem Section ── */}
      <section style={{ padding: 'var(--space-20) 0', background: 'var(--bg-base)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto' }}>
          <div className="scroll-reveal">
            <div className="badge badge-danger" style={{ marginBottom: 'var(--space-4)' }}>The Problem</div>
            <h2 style={{ marginBottom: 'var(--space-5)' }}>The <span className="text-gradient">Skill Gap Crisis</span> in India</h2>
            <p style={{ fontSize: '1.02rem', lineHeight: 1.8, marginBottom: 'var(--space-8)' }}>
              Over 50% of engineering graduates in India are not directly employable due to misalignment between college curricula and industry requirements. Companies struggle to find talent, while qualified students miss opportunities.
            </p>
          </div>
          <div className="landing-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
            {[
              { value: '51%', label: 'Graduates not industry-ready', color: 'var(--color-danger)' },
              { value: '3.7M', label: 'Annual engineering graduates', color: 'var(--color-warning)' },
              { value: '40%', label: 'Curriculum-industry skill mismatch', color: 'var(--color-primary)' },
            ].map((s, i) => (
              <div key={i} className={`card scroll-reveal delay-${i + 1}`} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: s.color, marginBottom: 8 }}>{s.value}</div>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: 'var(--space-20) 0', background: 'var(--bg-elevated)' }}>
        <div className="container">
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <div className="badge badge-violet" style={{ marginBottom: 'var(--space-3)' }}>Process</div>
            <h2>How <span className="text-gradient">EduNex</span> Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-5)' }}>
            {STEPS.map((s, i) => (
              <div key={i} className={`card scroll-reveal delay-${i + 1}`} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: s.color, marginBottom: 12 }}>STEP {s.step}</div>
                <div style={{ width: 56, height: 56, background: `${s.color}15`, border: `2px solid ${s.color}30`, borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto var(--space-4)' }}>{s.icon}</div>
                <h4 style={{ color: s.color, marginBottom: 8 }}>{s.role}</h4>
                <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>{s.action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: 'var(--space-20) 0', background: 'var(--bg-base)' }}>
        <div className="container">
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <div className="badge badge-cyan" style={{ marginBottom: 'var(--space-3)' }}>Platform Features</div>
            <h2>Powered by <span className="text-gradient">Skill Intelligence</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className={`card scroll-reveal delay-${(i % 3) + 1}`}>
                <div style={{ width: 48, height: 48, background: `${f.color}15`, border: `1px solid ${f.color}30`, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 'var(--space-4)' }}>{f.icon}</div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{f.title}</h4>
                <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Students ── */}
      <section id="for-students" style={{ padding: 'var(--space-20) 0', background: 'var(--bg-elevated)' }}>
        <div className="container">
          <div className="landing-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-10)', alignItems: 'center' }}>
            <div className="scroll-reveal">
              <div className="badge badge-cyan" style={{ marginBottom: 'var(--space-4)' }}>For Students</div>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>Know Exactly <span className="text-gradient">Where You Stand</span></h2>
              <p style={{ marginBottom: 'var(--space-6)', lineHeight: 1.7 }}>Get your personal Industry Readiness Score, discover which skills you're missing, and receive course recommendations tailored to your exact gaps.</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {['📊 Real-time Industry Readiness Score', '⚡ Personalized skill gap analysis', '🎓 Recommended courses for missing skills', '💼 Jobs matched to your skill level', '📋 Track all your applications in one place'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup/student" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-6)', display: 'inline-flex' }}>Start as Student →</Link>
            </div>
            {/* Skill gap demo card */}
            <div className="card scroll-reveal delay-2" style={{ background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                <h4 style={{ fontSize: '1.1rem' }}>Industry Readiness</h4>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)' }} className="text-gradient">65%</span>
              </div>
              <div className="progress-wrapper" style={{ marginBottom: 'var(--space-5)' }}>
                <div className="progress-track"><div className="progress-fill" style={{ width: '65%' }} /></div>
              </div>
              {[{ name: 'Python', status: 'partial', label: 'Intermediate → Advanced' }, { name: 'Machine Learning', status: 'missing', label: 'Missing' }, { name: 'SQL', status: 'partial', label: 'Beginner → Intermediate' }, { name: 'HTML/CSS', status: 'matched', label: 'Matched ✓' }].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</span>
                  <span className={`skill-tag skill-${s.status}`} style={{ fontSize: '0.72rem' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── For Colleges ── */}
      <section id="for-colleges" style={{ padding: 'var(--space-20) 0', background: 'var(--bg-base)' }}>
        <div className="container">
          <div className="landing-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-10)', alignItems: 'center' }}>
            <div className="card scroll-reveal delay-1">
              <h4 style={{ marginBottom: 'var(--space-4)', fontSize: '1.1rem' }}>Curriculum vs Industry Demand</h4>
              {[{ skill: 'Machine Learning', curriculum: 40, industry: 95 }, { skill: 'Cloud Computing', curriculum: 30, industry: 88 }, { skill: 'React.js', curriculum: 55, industry: 82 }, { skill: 'Docker', curriculum: 20, industry: 75 }].map((item, i) => (
                <div key={i} style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.skill}</span>
                    <span className="badge badge-danger" style={{ fontSize: '0.68rem' }}>Gap: {item.industry - item.curriculum}%</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 65 }}>Curriculum</span>
                      <div className="progress-track" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${item.curriculum}%`, background: 'var(--gradient-cyan)' }} /></div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--cyan-400)', width: 28, textAlign: 'right' }}>{item.curriculum}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 65 }}>Industry</span>
                      <div className="progress-track" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${item.industry}%` }} /></div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--violet-400)', width: 28, textAlign: 'right' }}>{item.industry}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="scroll-reveal delay-2">
              <div className="badge badge-violet" style={{ marginBottom: 'var(--space-4)' }}>For Colleges</div>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>Data-Driven <span className="text-gradient">Curriculum Planning</span></h2>
              <p style={{ marginBottom: 'var(--space-6)', lineHeight: 1.7 }}>See exactly which skills industries demand vs. what you're teaching. Identify curriculum gaps at the department level and make evidence-based improvements.</p>
              <Link to="/signup/college" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>Start as College →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── For Industry ── */}
      <section id="for-industry" style={{ padding: 'var(--space-20) 0', background: 'var(--bg-elevated)' }}>
        <div className="container">
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <div className="badge badge-success" style={{ marginBottom: 'var(--space-3)' }}>For Industry</div>
            <h2>Find Talent That <span className="text-gradient">Matches Your Stack</span></h2>
            <p style={{ maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>Define your required skills, post jobs, publish courses, and discover students ready for your team.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {['Post jobs with required skills', 'Search talent by skill & readiness score', 'Publish courses to bridge skill gaps', 'View college skill analytics', 'Shortlist and track applicants', 'Connect with institutions directly'].map((f, i) => (
              <div key={i} className={`scroll-reveal delay-${(i % 3) + 1}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                <span style={{ color: 'var(--color-success)', fontSize: '1.1rem', fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>
          <div className="scroll-reveal delay-3" style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <Link to="/signup/industry" className="btn btn-primary btn-xl">Start as Company →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'var(--space-20) 0', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, background: 'rgba(124,58,237,0.12)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div className="container scroll-reveal" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>Ready to <span className="text-gradient">Bridge the Gap?</span></h2>
          <p style={{ fontSize: '1rem', marginBottom: 'var(--space-8)', maxWidth: 480, margin: '0 auto var(--space-8)', lineHeight: 1.7 }}>Join thousands of students, colleges, and companies already using EduNex to close the skill gap.</p>
          <div className="landing-hero-cta" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Link to={`/${user.role}/dashboard`} className="btn btn-primary btn-xl">Go to Dashboard</Link>
                <button onClick={logout} className="btn btn-secondary btn-xl">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/signup/student" className="btn btn-primary btn-xl">Join as Student</Link>
                <Link to="/login" className="btn btn-secondary btn-xl">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)', padding: 'var(--space-8) 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontWeight: 700 }}>
            <img src={logo} alt="Logo" style={{ width: 28, height: 28, background: '#fff', borderRadius: 'var(--radius-md)', padding: '2px', objectFit: 'contain' }} />
            <span className="text-gradient">EduNex</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', margin: 0, textAlign: 'center' }}>EduNex · Skill Gap Intelligence Platform</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <Link to="/signup/student" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Students</Link>
            <Link to="/signup/college" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Colleges</Link>
            <Link to="/signup/industry" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Industry</Link>
          </div>
        </div>
      </footer>

      {/* Responsive media query overrides for Navbar */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
