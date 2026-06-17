import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Features from '../components/Features';
import Footer from '../components/Footer';

/*
  Design tokens injected at the root so Navbar, Features, Footer
  all share the same palette without a separate CSS file.
  Swap --dg-blue to match Rigshospitalet's exact brand blue if needed.
*/
const injectTokens = () => {
  if (document.getElementById('dg-tokens')) return;
  const style = document.createElement('style');
  style.id = 'dg-tokens';
  style.textContent = `
    :root {
      --dg-blue:       #1a6fa8;
      --dg-blue-light: #daeeff;
      --dg-blue-bg:    #f0f7ff;
      --dg-blue-border:#cce0f5;
      --dg-text:       #0f1f2e;
      --dg-text-muted: #5a7a90;
      --dg-border:     rgba(15, 31, 46, 0.12);
      --dg-font:       -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
  `;
  document.head.appendChild(style);
};

function HomePage() {
  useEffect(() => { injectTokens(); }, []);

  return (
    <div style={{ padding: '0 48px', maxWidth: '1100px', margin: '0 auto' }}>
      <Navbar />
      <Features />
      <Footer />
    </div>
  );
}

export default HomePage;