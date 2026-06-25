import config from '../config';

const tools = [
  {
    
    title: 'Genome aggregation browser',
    description:
      'Explore DenGen aggregated and harmonized exome and genome sequencing data as well as summary data.',
    label: 'Explore now',
    href: config.GENOME_AGGREGATION_BROWSER,
    external: true,
    badge: 'Coming soon',
  },
  {
   
    title: 'Allele frequency browser',
    description:
      'Discover allele frequency insights in DenGen’s harmonized genomic dataset, enabling population-scale variant exploration.',
    label: 'Browse now',
    href: config.ALLELE_FREQUENCY_BROWSER,
    external: true,
  },
  {
   
    title: 'Danish Beacon',
    description:
      'Discover Danish Human Genomic data securely with the GA4GH Beacon protocol.',
    label: 'Learn more',
    href: '/beacon',
    external: false,
  },
  {
    
    title: 'Data quality portal',
    description:
      'Explore DenGen Data Quality Portal, designed to provide generic quality control reports over the cohort files.',
    label: 'Access portal',
    href: '/landing',
    external: false,
  },
];

const stats = [
  { value: "2,211",  label: "Unrelated individuals" },
  { value: "78.5M", label: "SNV Variants detected" },
  { value: "52×+",   label: "Avg. sequencing depth" },
  { value: "GRCh38", label: "Reference genome" }
];

const Features = () => {
  return (
    <div style={{ fontFamily: 'var(--dg-font)' }}>

      {/* ── Hero ── */}
      <div style={{
        background: '#f0f7ff',
        borderBottom: '0.5px solid #cce0f5',
        padding: '56px 48px',
        marginLeft: '-48px',
        marginRight: '-48px',
      }}>
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--dg-blue)',
          background: '#daeeff',
          borderRadius: '99px',
          padding: '3px 10px',
          marginBottom: '16px',
        }}>
          Danish population genomics
        </span>

        <h1 style={{
          fontSize: '36px',
          fontWeight: 500,
          color: '#0a3a5e',
          lineHeight: 1.2,
          marginBottom: '14px',
          maxWidth: '560px',
        }}>
          Understanding Danish<br />genetic diversity at scale
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#3a6080',
          lineHeight: 1.75,
          maxWidth: '520px',
          marginBottom: '28px',
        }}>
          DenGen is a genomics initiative designed to provide a comprehensive resource for understanding the genetic diversity of the Danish population.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="/cohort-statistics"
            style={{
              background: 'var(--dg-blue)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              padding: '9px 22px',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            View cohort statistics
          </a>
          <a
            href="/about"
            style={{
              background: 'transparent',
              color: 'var(--dg-blue)',
              fontSize: '13px',
              fontWeight: 500,
              padding: '9px 22px',
              borderRadius: '6px',
              border: '0.5px solid var(--dg-blue)',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#daeeff'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            Learn more
          </a>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: '0.5px solid var(--dg-border)',
        marginLeft: '-48px',
        marginRight: '-48px',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            padding: '22px 32px',
            borderRight: i < stats.length - 1 ? '0.5px solid var(--dg-border)' : 'none',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 500, color: '#0a3a5e' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--dg-text-muted)', marginTop: '3px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tools grid ── */}
      <div style={{ padding: '36px 0 48px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--dg-text-muted)',
          marginBottom: '16px',
        }}>
          Tools &amp; resources
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}>
          {tools.map((tool, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: '0.5px solid var(--dg-border)',
                borderRadius: '12px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
                transition: 'border-color 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--dg-blue)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--dg-border)'}
            >
              {/* Badge */}
              {tool.badge && (
                <span style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  fontSize: '10px',
                  fontWeight: 500,
                  background: '#f0f7ff',
                  color: 'var(--dg-blue)',
                  border: '0.5px solid #cce0f5',
                  borderRadius: '99px',
                  padding: '2px 8px',
                }}>
                  {tool.badge}
                </span>
              )}

              {/* Icon */}
              

              <h3 style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--dg-text)',
                margin: 0,
              }}>
                {tool.title}
              </h3>

              <p style={{
                fontSize: '12.5px',
                color: 'var(--dg-text-muted)',
                lineHeight: 1.65,
                margin: 0,
                flexGrow: 1,
              }}>
                {tool.description}
              </p>

              <a
                href={tool.href}
                target={tool.external ? '_blank' : undefined}
                rel={tool.external ? 'noopener noreferrer' : undefined}
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--dg-blue)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {tool.label} 
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
