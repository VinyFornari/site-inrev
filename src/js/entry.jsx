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
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
})();
