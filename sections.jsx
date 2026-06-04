const { useState } = React;
const { SR, SectionLabel, CTAButton } = window;

/* ===== Solutions Intro Section ===== */
function SolutionsIntro() {
  return (
    <section id="solutions" style={{
      background: 'var(--bg-white)', padding: 'clamp(80px, 10vw, 140px) 32px'
    }}>
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          gap: 'clamp(40px, 5vw, 80px)', alignItems: 'center'
        }}>
          <div>
            <SR>
              <SectionLabel text="Solutions" color="var(--accent-neon)" />
            </SR>
            <SR delay={100}>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1,
                color: 'var(--text-dark)', letterSpacing: '-0.02em',
                marginBottom: 24, textWrap: 'balance'
              }}>
                Inteligência Artificial como alavanca de negócio
              </h2>
            </SR>
            <SR delay={200}>
              <p style={{
                fontSize: 'clamp(16px, 1.2vw, 18px)', lineHeight: 1.75,
                color: 'var(--text-muted)', marginBottom: 40
              }}>
                Somos uma consultoria orientada por IA. Ajudamos PMEs a entender
                onde e como aplicar inteligência artificial na operação, com foco em
                resultados práticos: mais eficiência, mais performance e mais agilidade
                no dia a dia da sua empresa.
              </p>
            </SR>
            <SR delay={300}>
              <CTAButton text="Divida seu desafio com a gente"
                href="https://wa.me/5516997557604" variant="dark" />
            </SR>
          </div>

          <SR delay={200}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16
            }}>
              {[
                { num: '01', title: 'Mentoria', desc: 'Direcionamento estratégico para aplicar IA no negócio' },
                { num: '02', title: 'Capacitação', desc: 'Equipes preparadas para dominar ferramentas de IA' },
                { num: '03', title: 'Automação', desc: 'Processos inteligentes que eliminam trabalho manual' },
                { num: '04', title: 'Inteligência de Negócio', desc: 'Decisões baseadas em inteligência e evidências' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '28px 28px', borderRadius: 14,
                  background: 'var(--bg-light)', border: '1px solid #ECECEC',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-neon)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(168,85,247,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ECECEC';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
                    color: 'var(--accent-neon)', letterSpacing: 1
                  }}>
                    {item.num}
                  </span>
                  <div style={{
                    fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800,
                    color: 'var(--text-dark)', letterSpacing: '-0.01em', lineHeight: 1.3
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)', fontWeight: 500
                  }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </SR>
        </div>
      </div>
    </section>
  );
}

/* ===== Core Expertise Icons ===== */
const expertiseIcons = {
  strategy: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
  training: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93"/><path d="M8 6a4 4 0 0 1 3.25 3.93"/>
      <circle cx="12" cy="14" r="3"/><path d="M12 17v4"/><path d="M8 22h8"/>
    </svg>
  ),
  automation: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M5 9v3a1 1 0 0 0 1 1h5m8-4v3a1 1 0 0 1-1 1h-5m0 0v3"/>
    </svg>
  ),
  data: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3"/><ellipse cx="12" cy="6" rx="9" ry="3"/><path d="M3 6v12c0 1.66 4.03 3 9 3s9-1.34 9-3V6"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
    </svg>
  ),
};

/* ===== Core Expertise Data — AI Pillars ===== */
const expertiseData = [
  {
    num: '01',
    icon: 'strategy',
    color: 'var(--accent-neon)',
    title: 'Estratégia & Mentoria em IA',
    desc: 'Orientamos donos de negócio e lideranças na jornada de adoção de IA. Diagnóstico de maturidade, roadmap de implementação e mentoria contínua para transformar inteligência artificial em vantagem competitiva real.',
  },
  {
    num: '02',
    icon: 'training',
    color: 'var(--accent-cyan)',
    title: 'Capacitação & Cultura de IA',
    desc: 'Treinamos equipes para dominar ferramentas de IA no dia a dia. Workshops práticos, capacitação contínua e construção de uma cultura de inovação que permeia toda a organização.',
  },
  {
    num: '03',
    icon: 'automation',
    color: 'var(--accent-magenta)',
    title: 'Automação Inteligente',
    desc: 'Automatizamos processos internos com IA, desde workflows e tarefas repetitivas até chatbots e assistentes de atendimento ao cliente. Menos trabalho manual, mais eficiência operacional.',
  },
  {
    num: '04',
    icon: 'data',
    color: 'var(--accent-blue)',
    title: 'Dados & Inteligência de Negócio',
    desc: 'Transformamos dados em decisões estratégicas. Análise inteligente, indicadores automatizados e BI potencializado por IA para que sua empresa tome decisões baseadas em evidências.',
  },
];

/* ===== Core Expertise Section ===== */
function CoreExpertise() {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="expertise" style={{
      background: 'var(--bg-primary)', padding: 'clamp(80px, 10vw, 140px) 32px',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%) rotate(90deg)',
        fontFamily: 'var(--font-heading)', fontSize: 'clamp(80px, 12vw, 180px)',
        fontWeight: 800, color: 'rgba(255,255,255,0.015)', letterSpacing: 8,
        whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none'
      }}>
        AI-DRIVEN
      </div>

      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <SR>
          <SectionLabel text="Expertise" color="var(--accent-neon)" />
        </SR>

        <SR delay={100}>
          <blockquote style={{
            fontFamily: 'var(--font-heading)', fontWeight: 600,
            fontSize: 'clamp(24px, 3vw, 38px)', lineHeight: 1.35,
            color: 'var(--text-white)', fontStyle: 'italic',
            maxWidth: 900, margin: '0 0 28px', letterSpacing: '-0.01em',
            textWrap: 'balance'
          }}>
            <span style={{ color: 'var(--accent-neon)', fontSize: '1.4em', lineHeight: 0 }}>"</span>
            A inteligência artificial não é mais o futuro. É a ferramenta mais poderosa
            disponível hoje para PMEs que querem crescer com mais eficiência
            <span style={{ color: 'var(--accent-neon)', fontSize: '1.4em', lineHeight: 0 }}>"</span>
          </blockquote>
        </SR>

        <SR delay={200}>
          <p style={{
            fontSize: 'clamp(15px, 1.1vw, 17px)', lineHeight: 1.75,
            color: 'rgba(255,255,255,0.45)', maxWidth: 700, marginBottom: 64
          }}>
            Muitos empresários enxergam o potencial da IA, mas não sabem por onde
            começar. Nós identificamos as alavancas certas do seu negócio e
            direcionamos a aplicação de IA com foco em inovação, eficiência,
            performance e agilidade.
          </p>
        </SR>

        {/* 4 AI Pillars */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {expertiseData.map((area, i) => (
            <SR key={area.num} delay={250 + i * 100}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 'clamp(24px, 3vw, 48px)',
                  padding: 'clamp(32px, 3vw, 44px) 0',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'default',
                  ...(i === expertiseData.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.08)' } : {})
                }}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  minWidth: 60
                }}>
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800,
                    color: area.color, letterSpacing: 1, opacity: 0.7
                  }}>
                    {area.num}
                  </span>
                  <div style={{
                    color: area.color, opacity: hovered === i ? 1 : 0.5,
                    transition: 'opacity 0.3s'
                  }}>
                    {expertiseIcons[area.icon]}
                  </div>
                </div>

                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(22px, 2.2vw, 32px)',
                    fontWeight: 800, color: '#fff',
                    letterSpacing: '-0.01em', marginBottom: 14,
                    transition: 'color 0.3s',
                    ...(hovered === i ? { color: area.color } : {})
                  }}>
                    {area.title}
                  </h3>
                  <p style={{
                    fontSize: 'clamp(14px, 1.05vw, 16px)', lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.5)', maxWidth: 680
                  }}>
                    {area.desc}
                  </p>
                </div>
              </div>
            </SR>
          ))}
        </div>

        <SR delay={700}>
          <div style={{ marginTop: 56 }}>
            <CTAButton text="Fale com um Especialista" variant="outline"
              href="https://wa.me/5516997557604" />
          </div>
        </SR>
      </div>
    </section>
  );
}

/* ===== About Section ===== */
function AboutSection() {
  return (
    <section id="about" style={{
      background: 'var(--bg-light)', padding: 'clamp(80px, 10vw, 140px) 32px',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
          gap: 'clamp(40px, 5vw, 80px)'
        }}>
          <div>
            <SR>
              <SectionLabel text="About" color="var(--accent-neon)" />
            </SR>
            <SR delay={100}>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.08,
                color: 'var(--text-dark)', letterSpacing: '-0.02em',
                marginBottom: 32, textWrap: 'balance'
              }}>
                Seu parceiro na jornada da{' '}
                <span style={{
                  color: 'var(--accent-neon)'
                }}>nova economia</span>
              </h2>
            </SR>
            <SR delay={200}>
              <p style={{
                fontSize: 'clamp(15px, 1.1vw, 17px)', lineHeight: 1.8,
                color: 'var(--text-muted)', marginBottom: 24
              }}>
                A Inrev existe para guiar pequenas e médias empresas neste novo
                momento dos negócios. Sabemos que muitos empresários enxergam o
                potencial da IA, mas não sabem por onde começar, como aplicá-la
                na operação e como adaptar o negócio à nova economia.
              </p>
            </SR>
            <SR delay={300}>
              <p style={{
                fontSize: 'clamp(15px, 1.1vw, 17px)', lineHeight: 1.8,
                color: 'var(--text-muted)', marginBottom: 36
              }}>
                É aí que entramos. Mapeamos as oportunidades do seu negócio, direcionamos
                a aplicação de IA onde gera mais impacto e ajudamos você a revisitar
                seu modelo de negócio para se manter competitivo e em constante evolução.
              </p>
            </SR>
            <SR delay={400}>
              <CTAButton text="Conheça nossa abordagem"
                href="https://wa.me/5516997557604" variant="dark" />
            </SR>
          </div>

          <div>
            <SR delay={200}>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 20
              }}>
                {[
                  {
                    title: 'Feito para PMEs',
                    desc: 'Entendemos a realidade de quem precisa inovar sem a estrutura de uma grande corporação. Projetos dimensionados para sua realidade.',
                    color: 'var(--accent-neon)'
                  },
                  {
                    title: 'IA como alavanca, não como fim',
                    desc: 'Não vendemos tecnologia pela tecnologia. Usamos IA como ferramenta para resolver problemas reais: reduzir custos, ganhar tempo e tomar decisões melhores.',
                    color: 'var(--accent-cyan)'
                  },
                  {
                    title: 'Adaptação estratégica',
                    desc: 'Processos e posicionamento digital repensados para a nova economia.',
                    color: 'var(--accent-magenta)'
                  },
                  {
                    title: 'Evolução contínua',
                    desc: 'Não é um projeto com data de fim. Construímos um caminho de evolução constante para que sua empresa acompanhe o ritmo da transformação digital.',
                    color: 'var(--accent-blue)'
                  },
                ].map((item, i) => (
                  <SR key={i} delay={300 + i * 100}>
                    <div style={{
                      padding: 28, borderRadius: 14,
                      background: 'var(--bg-white)',
                      border: '1px solid #ECECEC',
                      borderLeft: `3px solid ${item.color}`,
                      transition: 'transform 0.3s, box-shadow 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <h4 style={{
                        fontFamily: 'var(--font-heading)', fontSize: 16,
                        fontWeight: 700, color: 'var(--text-dark)',
                        marginBottom: 8
                      }}>
                        {item.title}
                      </h4>
                      <p style={{
                        fontSize: 14, lineHeight: 1.7,
                        color: 'var(--text-muted)', margin: 0
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  </SR>
                ))}
              </div>
            </SR>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { SolutionsIntro, CoreExpertise, AboutSection });
