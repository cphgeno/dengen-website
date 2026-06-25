import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '../config';

// ── Route definitions ──────────────────────────────────────────────
const aboutItems = [
  { to: '/about',          label: 'DenGen' },
  { to: '/pipelines',      label: 'Pipelines' },
  { to: '/data-use-terms', label: 'Data use terms' },
  { to: '/data-access',    label: 'Data access' },
  { to: '/citation',       label: 'Citation' },
  { to: '/contact',        label: 'Contact' },
];

const toolingItems = [
  { configKey: 'GENOME_AGGREGATION_BROWSER', label: 'Genome aggregation browser', external: true, badge: 'Soon' },
  { configKey: 'ALLELE_FREQUENCY_BROWSER',   label: 'Allele frequency browser',   external: true },
  { to: '/beacon',                           label: 'Danish Beacon',              newTab: true },
  { to: '/landing',                          label: 'Data quality portal',        newTab: true },
];

// Routes where the About dropdown should show as active
const aboutRoutes = aboutItems.map(i => i.to);
// Routes where Tooling dropdown should show as active
const toolingRoutes = ['/beacon', '/landing'];

// ── External link icon ─────────────────────────────────────────────
const ExternalIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
    style={{ opacity: 0.4, flexShrink: 0 }}>
    <path d="M2 8L8 2M8 2H4M8 2V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Chevron icon ───────────────────────────────────────────────────
const Chevron = ({ open }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
    style={{ opacity: 0.45, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

// ── Dropdown panel ─────────────────────────────────────────────────
const DropdownPanel = ({ items, onClose }) => (
  <div style={{
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff',
    border: '0.5px solid var(--dg-border)',
    borderRadius: '10px',
    boxShadow: '0 8px 28px rgba(15,31,46,0.10), 0 1px 4px rgba(15,31,46,0.06)',
    minWidth: '210px',
    zIndex: 300,
    padding: '6px',
    // Invisible bridge so mouse can travel from trigger to panel
    '::before': { content: '""' },
  }}>
    {/* Tiny upward triangle pointer */}
    <div style={{
      position: 'absolute', top: '-5px', left: '50%', transform: 'translateX(-50%)',
      width: '10px', height: '5px', overflow: 'hidden',
    }}>
      <div style={{
        width: '8px', height: '8px',
        background: '#fff',
        border: '0.5px solid var(--dg-border)',
        transform: 'rotate(45deg)',
        margin: '2px auto 0',
      }} />
    </div>

    {items.map((item, i) => {
      const isExternal = item.external || item.newTab;
      const baseStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        color: 'var(--dg-text)',
        textDecoration: 'none',
        fontFamily: 'var(--dg-font)',
        borderRadius: '6px',
        transition: 'background 0.1s',
        cursor: 'pointer',
      };
      const hoverIn  = e => e.currentTarget.style.background = 'var(--dg-blue-bg)';
      const hoverOut = e => e.currentTarget.style.background = 'transparent';

      const inner = (
        <>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {item.label}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {item.badge && (
              <span style={{
                fontSize: '10px', fontWeight: 500,
                background: 'var(--dg-blue-light)', color: 'var(--dg-blue)',
                border: '0.5px solid var(--dg-blue-border)',
                borderRadius: '99px', padding: '1px 6px',
              }}>
                {item.badge}
              </span>
            )}
            {isExternal && <ExternalIcon />}
          </span>
        </>
      );

      if (item.configKey) {
        return (
          <a key={i} href={config[item.configKey]} target="_blank" rel="noopener noreferrer"
            style={baseStyle} onMouseOver={hoverIn} onMouseOut={hoverOut} onClick={onClose}>
            {inner}
          </a>
        );
      }
      return (
        <Link key={i} to={item.to} target={item.newTab ? '_blank' : undefined}
          style={baseStyle} onMouseOver={hoverIn} onMouseOut={hoverOut} onClick={onClose}>
          {inner}
        </Link>
      );
    })}
  </div>
);

// ── Dropdown trigger ───────────────────────────────────────────────
const DropdownMenu = ({ label, items, isActive }) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const open_ = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const close_ = () => { closeTimer.current = setTimeout(() => setOpen(false), 150); };

  return (
    <li style={{ position: 'relative', listStyle: 'none' }}
      onMouseEnter={open_} onMouseLeave={close_}>
      <button
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--dg-font)', fontSize: '13px', padding: 0,
          display: 'flex', alignItems: 'center', gap: '4px',
          color: isActive || open ? 'var(--dg-blue)' : 'var(--dg-text-muted)',
          fontWeight: isActive ? 500 : 400,
          borderBottom: isActive ? '1.5px solid var(--dg-blue)' : '1.5px solid transparent',
          paddingBottom: '2px',
          transition: 'color 0.15s',
        }}
      >
        {label}
        <Chevron open={open} />
      </button>

      {open && (
        <DropdownPanel items={items} onClose={() => setOpen(false)} />
      )}
    </li>
  );
};

// ── Plain nav link ─────────────────────────────────────────────────
const NavLink = ({ to, label, pathname }) => {
  const active = pathname === to;
  return (
    <li style={{ listStyle: 'none' }}>
      <Link to={to} style={{
        fontSize: '13px', fontFamily: 'var(--dg-font)',
        textDecoration: 'none',
        color: active ? 'var(--dg-blue)' : 'var(--dg-text-muted)',
        fontWeight: active ? 500 : 400,
        borderBottom: active ? '1.5px solid var(--dg-blue)' : '1.5px solid transparent',
        paddingBottom: '2px',
        transition: 'color 0.15s',
      }}>
        {label}
      </Link>
    </li>
  );
};

// ── Navbar ─────────────────────────────────────────────────────────
const Navbar = () => {
  const { pathname } = useLocation();
  const aboutActive   = aboutRoutes.includes(pathname);
  const toolingActive = toolingRoutes.includes(pathname);

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 0',
      borderBottom: '0.5px solid var(--dg-border)',
      position: 'sticky', top: 0,
      background: '#fff',
      zIndex: 200,
    }}>

      {/* ── Logo ── */}
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        textDecoration: 'none',
        fontFamily: 'var(--dg-font)', fontSize: '17px', fontWeight: 500,
        color: 'var(--dg-text)',
      }}>
        {/* DNA helix icon mark */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2C4 2 7 4 9 9C11 14 14 16 14 16" stroke="#1a6fa8" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M14 2C14 2 11 4 9 9C7 14 4 16 4 16" stroke="#1a6fa8" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.4"/>
          <line x1="5.5" y1="6.5"  x2="12.5" y2="6.5"  stroke="#1a6fa8" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="4.5" y1="9"    x2="13.5" y2="9"    stroke="#1a6fa8" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="5.5" y1="11.5" x2="12.5" y2="11.5" stroke="#1a6fa8" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        DenGen
      </Link>

      {/* ── Links ── */}
      <ul style={{ display: 'flex', gap: '24px', alignItems: 'center', margin: 0, padding: 0 }}>
        <NavLink to="/" label="Home" pathname={pathname} />
        <DropdownMenu label="About"   items={aboutItems}   isActive={aboutActive} />
        <DropdownMenu label="Tooling" items={toolingItems} isActive={toolingActive} />
        <NavLink to="/cohort-statistics" label="Cohort statistics" pathname={pathname} />
      </ul>
    </nav>
  );
};

export default Navbar;
