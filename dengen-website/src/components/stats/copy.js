// UI copy that is not part of the data. Titles, descriptions, sources, notes,
// caveats and column meanings come from manifest.json; edit page wording here.

export const COPY = {
  pageTitle:     'DenGen statistics',
  breadcrumb:    'DenGen › Statistics',
  introFallback: 'Quality-control and call-set statistics for the DenGen cohort, computed from aggregate data.',
  callsetNote:   'These figures describe the full joint call set, not the subset released through the Beacon (AC ≥ 5 and AF ≥ 0.1%). Counts here are therefore larger than what a Beacon query returns.',
  sexChromNote:  'chrX and chrY were genotyped without ploidy awareness. Figures that select or include them are marked preliminary.',
  conventions:   'How to read this page',
  mockBanner:    'Mock data — these files are placeholders generated for development, not DenGen results.',
  contigLabel:   'Contig',

  titvNote:      'Ts/Tv rises with allele frequency and is lowest for the rarest variants (singletons and doubletons). No single headline Ts/Tv is shown, because the overall value depends on how many rare variants the call set contains.',
  autosomesOnly: 'Autosomes only. The contig selector does not apply to this figure.',
  rawCalls:      'Raw calls (before joint calling)',
  indelCap:      '−51 and +51 collect all deletions and insertions longer than 50 bp.',
  mafCap:        'The last bin is capped at MAF 0.5.',
  sampleOutside: n => `${n} sample${n === '1' ? '' : 's'} outside the plotted range`,
  availableFor:  (n, total) => (total ? `Available for ${n} of ${total} samples.` : `Available for ${n} samples.`),
  sourceJoint:   'Joint call set',
  sourceRaw:     'Raw calls',
  perContig:     'Per-contig breakdown',
  summary:       'Summary',

  // Fallback only when manifest.files.maf_classes.class_definitions is absent
  classDefinitions: {
    singleton: 'MAC = 1',
    doubleton: 'MAC = 2',
    rare: 'MAC ≥ 3 and MAF < 0.1%',
    low_frequency: '0.1% ≤ MAF < 1%',
    common: '1% ≤ MAF < 5%',
    very_common: 'MAF ≥ 5%',
  },
  scopeLabels: { all: 'All SNVs', singleton: 'Singletons' },

  // Summary-table rows that are bookkeeping, not statistics
  missingnessSkip: ['bad_records_skipped', 'an_gt_2n_clamped'],

  // QUAL bin edges for Ts/Tv: [label, lower (inclusive), upper (exclusive)]
  qualBins: [
    ['<1', -Infinity, 1], ['1–10', 1, 10], ['10–30', 10, 30],
    ['30–100', 30, 100], ['100–300', 100, 300], ['>300', 300, Infinity],
  ],
};
