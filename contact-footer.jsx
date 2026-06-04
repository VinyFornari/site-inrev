const { useState } = React;
const { SR, SectionLabel } = window;

/* ===== Contact Section ===== */
function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', role: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (!form.email.trim() || !form.email.includes('@')) errs.email = true;
    if (!form.message.trim()) errs.message = true;
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    const subject = encodeURIComponent(`Novo contato via site: ${form.name}`);
    const body = encodeURIComponent(
      `Nome: ${form.name}\nE-mail: ${form.email}\nCargo: ${form.role || 'Não informado'}\n\nMensagem:\n${form.message}`
    );
    window.open(`mailto:vinicius@inrev.com.br?subject=${subject}&body=${body}`, '_blank');
    setSubmitted(true);
  };

  const inputStyle = (field) => ({
    borderColor: errors[field] ? '#EF4444' : undefined,
  });

  return (
    <section id="contact" style={{
      background: 'var(--bg-white)', padding: 'clamp(80px, 10vw, 140px) 32px'
    }}>
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
          gap: 'clamp(48px, 6vw, 100px)', alignItems: 'start'
        }}>
          {/* Left — Info */}
          <div>
            <SR>
              <SectionLabel text="Contact" color="var(--accent-neon)" />
            </SR>
            <SR delay={100}>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.1,
                color: 'var(--text-dark)', letterSpacing: '-0.02em',
                marginBottom: 24, textWrap: 'balance'
              }}>
                Get in <span style={{ color: 'var(--accent-neon)' }}>Touch</span>
              </h2>
            </SR>
            <SR delay={200}>
              <p style={{
                fontSize: 'clamp(15px, 1.1vw, 17px)', lineHeight: 1.75,
                color: 'var(--text-muted)', marginBottom: 40, maxWidth: 440
              }}>
                Fale com o nosso time comercial ou preencha o formulário.
                Será um prazer falar com você!
              </p>
            </SR>
            <SR delay={300}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <ContactInfoItem
                  icon={<PhoneIcon />}
                  label="WhatsApp"
                  value="+55 (16) 99638-1080"
                  href="https://wa.me/5516997557604"
                />
                <ContactInfoItem
                  icon={<MailIcon />}
                  label="E-mail"
                  value="atendimento@inrev.com.br"
                  href="mailto:atendimento@inrev.com.br"
                />
                <ContactInfoItem
                  icon={<MapIcon />}
                  label="Endereço"
                  value="Av. Antônio Diederichsen, 400, Ribeirão Preto / SP"
                />
                <ContactInfoItem
                  icon={<ClockIcon />}
                  label="Horário"
                  value="Seg à Sex: 9h às 17h"
                />
              </div>
            </SR>


          </div>

          {/* Right — Form */}
          <SR delay={200}>
            <div style={{
              background: 'var(--bg-light)', borderRadius: 20,
              padding: 'clamp(32px, 3vw, 48px)',
              border: '1px solid #E8E8E8'
            }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'var(--accent-neon)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="var(--bg-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-heading)', fontSize: 22,
                    fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8
                  }}>
                    Mensagem enviada!
                  </h3>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
                    Entraremos em contato em breve.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{
                    fontFamily: 'var(--font-heading)', fontSize: 18,
                    fontWeight: 700, color: 'var(--text-dark)', marginBottom: 28,
                    letterSpacing: 0.5
                  }}>
                    PRONTO PARA COMEÇAR?
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <input className="form-input" type="text" placeholder="Nome completo"
                      style={inputStyle('name')}
                      value={form.name}
                      onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: false }); }} />
                    <input className="form-input" type="email" placeholder="Seu melhor e-mail"
                      style={inputStyle('email')}
                      value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: false }); }} />
                    <input className="form-input" type="text" placeholder="Cargo / função"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })} />
                    <textarea className="form-input" placeholder="Como podemos te ajudar?"
                      rows={4}
                      style={{ ...inputStyle('message'), resize: 'vertical', fontFamily: 'var(--font-body)' }}
                      value={form.message}
                      onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: false }); }} />
                  </div>
                  <button type="submit" className="submit-btn" style={{ marginTop: 24, width: '100%' }}>
                    ENVIAR
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </SR>
        </div>
      </div>
    </section>
  );
}

/* ===== Contact Info Item ===== */
function ContactInfoItem({ icon, label, value, href }) {
  const content = (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'var(--bg-light)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-dark)', flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
          letterSpacing: 0.5, marginBottom: 2, fontFamily: 'var(--font-heading)',
          textTransform: 'uppercase'
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 15, color: 'var(--text-dark)', fontWeight: 500
        }}>
          {value}
        </div>
      </div>
    </div>
  );
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{content}</a>;
  }
  return content;
}

/* ===== Mini Icons ===== */
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

/* ===== Footer ===== */
function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--bg-primary)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: 'clamp(60px, 6vw, 80px) 32px 32px'
    }}>
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'clamp(32px, 4vw, 60px)',
          paddingBottom: 48,
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          {/* Brand */}
          <div>
            <img src="data:image/png;base64,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"
              alt="Inrev" style={{ height: 34, objectFit: 'contain', marginBottom: 20 }}
              onError={(e) => { e.target.style.display = 'none'; }} />
            <p style={{
              fontSize: 14, lineHeight: 1.7,
              color: 'rgba(255,255,255,0.4)', maxWidth: 280
            }}>
              Apoiamos PMEs a se adaptarem à nova economia usando inteligência artificial como alavanca de negócio. Inovação, estratégia e tecnologia para empresas em constante evolução.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
              letterSpacing: 2, color: 'var(--accent-neon)',
              textTransform: 'uppercase', marginBottom: 20
            }}>
              Expertise
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Estratégia & Mentoria em IA', id: 'expertise' },
                { label: 'Capacitação & Cultura de IA', id: 'expertise' },
                { label: 'Automação Inteligente', id: 'expertise' },
                { label: 'Dados & Inteligência de Negócio', id: 'expertise' },
              ].map((link, i) => (
                <a key={i} href={`#${link.id}`} className="ft-link"
                  style={{ fontSize: 14, fontWeight: 500 }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
              letterSpacing: 2, color: 'var(--accent-neon)',
              textTransform: 'uppercase', marginBottom: 20
            }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="ft-link" style={{ fontSize: 14 }}>
                Av. Antônio Diederichsen, 400
              </span>
              <span className="ft-link" style={{ fontSize: 14 }}>
                Ribeirão Preto / São Paulo
              </span>
              <a href="mailto:atendimento@inrev.com.br" className="ft-link" style={{ fontSize: 14 }}>
                atendimento@inrev.com.br
              </a>
              <span className="ft-link" style={{ fontSize: 14 }}>
                Seg à Sex: 9h às 17h
              </span>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
              letterSpacing: 2, color: 'var(--accent-neon)',
              textTransform: 'uppercase', marginBottom: 20
            }}>
              Social
            </h4>
            <a href="https://www.linkedin.com/company/inrev-control-management"
              target="_blank" rel="noopener noreferrer"
              className="ft-link"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 14, fontWeight: 500
              }}>
              <LinkedInIcon />
              LinkedIn
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', gap: 16, paddingTop: 28
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
            ©{currentYear} Inrev Gestão e Desenvolvimento LTDA. CNPJ 42.388.088/0001-00.
            Todos os direitos reservados.
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" className="ft-link" style={{ fontSize: 13 }}>Política de Privacidade</a>
            <a href="#" className="ft-link" style={{ fontSize: 13 }}>Política de Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { ContactSection, SiteFooter });
