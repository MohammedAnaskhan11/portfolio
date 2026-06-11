import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';

import BackgroundFX from './components/BackgroundFX';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Achievements from './components/Achievements';
import Experience from './components/Experience';
import Contact from './components/Contact';
import LoadingScreen from './components/LoadingScreen';
import ScrollToTop from './components/ScrollToTop';
import AdminPage from './pages/AdminPage';

// ── Public portfolio ────────────────────────────────────────────────
function Portfolio() {
  const [loaded, setLoaded] = useState(false);
  const onDone = useCallback(() => setLoaded(true), []);

  return (
    <>
      <LoadingScreen onDone={onDone} />
      <div className="relative min-h-screen" style={{ visibility: loaded ? 'visible' : 'hidden' }}>
        <BackgroundFX />
        <CustomCursor />
        <Navbar />
        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Achievements />
          <Experience />
          <Contact />
        </main>
        <footer className="py-8 border-t border-[var(--glass-border)] text-center">
          <p className="font-mono text-xs text-subtle">
            © {new Date().getFullYear()} Mohammed Anas Khan &nbsp;·&nbsp; Built with React, Three.js &amp; Framer Motion
          </p>
        </footer>
        <ScrollToTop />
      </div>
    </>
  );
}

// ── App with routing ────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <DataProvider>
          <Routes>
            <Route path="/"      element={<Portfolio />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </DataProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
