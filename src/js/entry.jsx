/* === entry === */
(function() {
  const { Header, Hero, SolutionsIntro, CoreExpertise, AboutSection, ContactSection, SiteFooter } = window;
  function App() {
    return (
      <React.Fragment>
        <Header />
        <main>
          <Hero /><SolutionsIntro /><CoreExpertise /><AboutSection /><ContactSection />
        </main>
        <SiteFooter />
      </React.Fragment>
    );
  }
  window.InrevApp = App;
  if (window.__INREV_SSR__) return;
  const el = document.getElementById('root');
  // O build pré-renderiza a home dentro de #root: o React só hidrata.
  if (el.firstElementChild) ReactDOM.hydrateRoot(el, <App />);
  else ReactDOM.createRoot(el).render(<App />);
})();
