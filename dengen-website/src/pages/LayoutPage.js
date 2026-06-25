import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const injectTokens = () => {
  if (document.getElementById('dg-tokens')) return;
  const style = document.createElement('style');
  style.id = 'dg-tokens';
  style.textContent = `
    :root {
      --dg-blue:        #1a6fa8;
      --dg-blue-light:  #daeeff;
      --dg-blue-bg:     #f0f7ff;
      --dg-blue-border: #cce0f5;
      --dg-text:        #0f1f2e;
      --dg-text-muted:  #5a7a90;
      --dg-border:      rgba(15, 31, 46, 0.12);
      --dg-font:        -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; background: #fff; }
    a { color: var(--dg-blue); }
  `;
  document.head.appendChild(style);
};

function Layout({ children }) {
  useEffect(() => { injectTokens(); }, []);

  return (
    <div style={{
      padding: '0 48px',
      maxWidth: '1100px',
      margin: '0 auto',
      fontFamily: 'var(--dg-font)',
    }}>
      <Navbar />
      <main style={{ padding: '40px 0 60px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
