/* === app === */
(function() {
const { useState, useEffect, useRef, useCallback } = React;

/* ===== ScrollReveal Component ===== */
function SR({ children, delay = 0, className = '', style = {} }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 900;
  const ref = useRef(null);
  const [vis, setVis] = useState(isMobile);
  useEffect(() => {
    if (isMobile) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  if (isMobile) {
    return <div className={className} style={style}>{children}</div>;
  }
  return (
    <div ref={ref} className={`sr ${vis ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

/* ===== Section Label (reusable) ===== */
function SectionLabel({ text, color = 'var(--accent-neon)', align = 'left' }) {
  return (
    <div style={{
      fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
      letterSpacing: 3, color, textTransform: 'uppercase',
      textAlign: align, marginBottom: 20
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 12
      }}>
        <span style={{
          width: 24, height: 2, background: color, borderRadius: 1,
          display: 'inline-block'
        }}></span>
        {text}
      </span>
    </div>
  );
}

/* ===== CTA Button ===== */
function CTAButton({ text, href, variant = 'dark', style: extraStyle = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700,
    padding: '15px 36px', borderRadius: 10, letterSpacing: 0.5,
    transition: 'all 0.3s ease', textDecoration: 'none',
    cursor: 'pointer',
  };
  const variants = {
    dark: { background: 'var(--bg-primary)', color: '#fff' },
    light: { background: '#fff', color: 'var(--bg-primary)' },
    outline: { background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)' },
  };
  return (
    <a href={href || '#'} target={href?.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer" style={{ ...base, ...variants[variant], ...extraStyle }}
      onMouseEnter={(e) => {
        if (variant === 'light') {
          e.currentTarget.style.background = 'var(--accent-neon)';
          e.currentTarget.style.color = '#fff';
        }
        if (variant === 'outline') {
          e.currentTarget.style.background = 'var(--accent-neon)';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = 'var(--accent-neon)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'light') {
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.color = 'var(--bg-primary)';
        }
        if (variant === 'outline') {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
        }
      }}>
      {text}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </a>
  );
}

/* ===== Header ===== */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = useCallback((id) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const navItems = [
    { label: 'Soluções', id: 'solutions' },
    { label: 'Expertise', id: 'expertise' },
    { label: 'Sobre', id: 'about' },
    { label: 'Blog', href: '/blog/' },
    { label: 'Contato', id: 'contact' },
  ];

  return (
    <React.Fragment>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div style={{
          width: '100%', maxWidth: 'var(--max-width)', margin: '0 auto',
          padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 110 }}>
            <img src="/assets/logo-inrev.png"
              alt="Inrev" style={{ height: 32, objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
            <span style={{
              display: 'none', fontFamily: 'var(--font-heading)', fontSize: 22,
              fontWeight: 800, color: '#fff', letterSpacing: -0.5
            }}>INREV</span>
          </a>

          {/* Desktop Nav */}
          <nav className="header-nav" style={{ gap: 36, alignItems: 'center' }}>
            {navItems.map(item => (
              <a key={item.href || item.id} href={item.href || `#${item.id}`}
                onClick={(e) => { if (!item.href) { e.preventDefault(); scrollTo(item.id); } }}>
                {item.label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="https://wa.me/5516997557604" target="_blank" rel="noopener noreferrer"
              className="header-cta" style={{ zIndex: 110 }}>
              Fale Conosco
            </a>
            <button className={`menu-toggle ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`}>
        {/* Close button */}
        <button onClick={() => setMenuOpen(false)}
          style={{
            position: 'absolute', top: 20, right: 24, zIndex: 120,
            width: 44, height: 44, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'none', border: 'none',
            cursor: 'pointer'
          }}
          aria-label="Fechar menu">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="var(--accent-neon)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        {navItems.map((item, i) => (
          <a key={item.href || item.id} href={item.href || `#${item.id}`}
            style={{ transitionDelay: menuOpen ? `${i * 60 + 100}ms` : '0ms' }}
            onClick={(e) => { if (!item.href) { e.preventDefault(); scrollTo(item.id); } else { setMenuOpen(false); } }}>
            {item.label}
          </a>
        ))}
      </div>
    </React.Fragment>
  );
}

/* ===== Hero Section ===== */
function Hero() {
  return (
    <section id="hero" style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      background: 'var(--bg-primary)', overflow: 'hidden',
      padding: '120px 32px 80px'
    }}>
      {/* Space Field Background */}
      <SpaceField />

      {/* Animated Blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: 'var(--accent-neon)', opacity: 0.08, filter: 'blur(140px)',
          top: '-20%', right: '-10%', animation: 'blobA 28s ease-in-out infinite',
          willChange: 'transform'
        }}></div>
        <div style={{
          position: 'absolute', width: 550, height: 550, borderRadius: '50%',
          background: 'var(--accent-magenta)', opacity: 0.07, filter: 'blur(130px)',
          bottom: '-15%', left: '-8%', animation: 'blobB 22s ease-in-out infinite',
          willChange: 'transform'
        }}></div>
        <div style={{
          position: 'absolute', width: 450, height: 450, borderRadius: '50%',
          background: 'var(--accent-cyan)', opacity: 0.06, filter: 'blur(120px)',
          top: '40%', left: '40%', animation: 'blobC 25s ease-in-out infinite',
          willChange: 'transform'
        }}></div>
      </div>

      {/* Subtle Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px'
      }}></div>

      {/* Content — two column layout */}
      <div className="hero-content-grid" style={{
        position: 'relative', zIndex: 2,
        maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        alignItems: 'center',
        gap: 'clamp(32px, 4vw, 64px)',
        minHeight: 'calc(100vh - 200px)'
      }}>
        <div style={{ maxWidth: 620 }}>
          <div className="hero-anim" style={{ animationDelay: '0.05s' }}>
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
              letterSpacing: 4, color: 'var(--accent-neon)', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 28
            }}>
              <span style={{ width: 28, height: 2, background: 'var(--accent-neon)', borderRadius: 1 }}></span>
              Inrev Control & Management
            </span>
          </div>

          <h1 className="hero-anim" style={{
            animationDelay: '0.1s',
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: 'clamp(36px, 4.5vw, 68px)', lineHeight: 1.08,
            color: 'var(--text-white)', letterSpacing: '-0.02em',
            marginBottom: 36, textWrap: 'balance'
          }}>
            Adapt to Change.{' '}
            Keep Your Business{' '}
            <span style={{
              color: 'var(--accent-neon)'
            }}>Evolving.</span>
          </h1>

          <p className="hero-anim" style={{
            animationDelay: '0.4s',
            fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.7,
            color: 'rgba(255,255,255,0.55)', maxWidth: 520, marginBottom: 44
          }}>
            Apoiamos pequenas e médias empresas a se adaptarem à nova economia
            com inteligência artificial. Revisitar o modelo de negócio, inovar na
            jornada do cliente e se posicionar de forma competitiva na era digital.
          </p>

          <div className="hero-anim" style={{
            animationDelay: '0.6s',
            display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'
          }}>
            <CTAButton text="Fale com um Especialista" variant="light"
              href="https://wa.me/5516997557604" />
            <CTAButton text="Our Solutions" variant="outline"
              href="#solutions" />
          </div>
        </div>

        {/* Globe — centered in right column */}
        <div className="hero-anim hero-globe-wrapper" style={{
          animationDelay: '0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'visible'
        }}>
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute', width: '110%', height: '110%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, rgba(168,85,247,0.02) 40%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
          <TechGlobe size={480} />
        </div>
      </div>

      {/* Mobile-only ambient effect */}
      <div className="hero-mobile-effect" style={{ display: 'none' }}></div>
      <div className="hero-mobile-ring1" style={{ display: 'none' }}></div>
      <div className="hero-mobile-ring2" style={{ display: 'none' }}></div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
        background: 'linear-gradient(transparent, var(--bg-primary))',
        pointerEvents: 'none'
      }}></div>
    </section>
  );
}

Object.assign(window, { SR, SectionLabel, CTAButton, Header, Hero });

})();
