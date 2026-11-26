/* === contact-footer === */
(function() {
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
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"></rect>
      <circle cx="12" cy="12" r="4"></circle>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"></circle>
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
            <img src="/assets/logo-inrev.png"
              alt="Inrev" style={{ height: 34, objectFit: 'contain', marginBottom: 20 }}
              onError={(e) => { e.target.style.display = 'none'; }} />
            <p style={{
              fontSize: 14, lineHeight: 1.7,
              color: 'rgba(255,255,255,0.4)', maxWidth: 280
            }}>
              Apoiamos PMEs a se adaptarem à nova economia usando inteligência artificial como alavanca de negócio. Inovação, estratégia e tecnologia para empresas em constante evolução.
            </p>
            <a href="/blog/" className="ft-link" style={{ display: 'inline-block', marginTop: 16, fontSize: 14, fontWeight: 600 }}>Blog</a>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              <a href="https://www.instagram.com/inrev_cm/"
                target="_blank" rel="noopener noreferrer"
                className="ft-link"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: 14, fontWeight: 500
                }}>
                <InstagramIcon />
                Instagram
              </a>
            </div>
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
            <a href="/politica-de-privacidade/" className="ft-link" style={{ fontSize: 13 }}>Política de Privacidade</a>
            <a href="/politica-de-cookies/" className="ft-link" style={{ fontSize: 13 }}>Política de Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { ContactSection, SiteFooter });

})();
