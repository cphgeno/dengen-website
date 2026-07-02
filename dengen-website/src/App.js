import './App.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import SamplePage from './pages/SamplePage';
import SVPage from './pages/SVPage';
import QCLandingPage from './pages/QCLandingPage';
import FastQCPage from './pages/FastQCPage';
import VariantPage from './pages/VariantPage';
import ContactPage from './pages/ContactPage';
import DataAccessPage from './pages/DataAccessPage';
import DataUseTermsPage from './pages/DataUseTermsPage';
import PipelinePage from './pages/PipelinePage';
import PublicationsPage from './pages/PublicationsPage';
import TeamPage from './pages/TeamPage';
import CitationPage from './pages/CitationPage';
import FundingPage from './pages/FundingPage';
import BeaconPage from './pages/BeaconPage';
import DenGenStats from './pages/DenGenStats';
import AlignmentsPage from './pages/AlignmentsPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import ComingSoonPage from './pages/CommingSoonPage';
import GA4GHPage from './pages/GA4GHPage';
import StandardsPage from './pages/StandardsPage';
import DUOPage from './pages/DUOPage';

function AppRoutes() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", "G-0EYMEP67W8", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return (
    <Routes>
      <Route exact path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/qc" element={<SamplePage />} />
      <Route path="/landing" element={<QCLandingPage />} />
      <Route path="/structural-variant/:filename" element={<SVPage />} />
      <Route path="/variant/:filename" element={<VariantPage />} />
      <Route path="/fastqc/:filename" element={<FastQCPage />} />
      <Route path="/alignments/:filename" element={<AlignmentsPage />} />
      <Route path="/pipelines" element={<PipelinePage />} />
      <Route path="/data-use-terms" element={<DataUseTermsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/data-access" element={<DataAccessPage />} />
      <Route path="/citation" element={<CitationPage />} />
      {/* <Route path="/funding" element={<FundingPage />} /> */}
      <Route path="/beacon" element={<BeaconPage />} />
      <Route path="/comming-soon" element={<ComingSoonPage />} />
      <Route path="/cohort-statistics" element={<DenGenStats />} />
      {/* <Route path="/publications" element={<PublicationsPage />} /> */}
      <Route path="/search" element={<SearchPage />} />
      <Route path="/ga4gh" element={<GA4GHPage />} />
      <Route path="/standards" element={<StandardsPage />} />
      <Route path="/data-use-ontology" element={<StandardsPage />} />
      <Route path="/*" element={<NotFoundPage />} />
    </Routes>
  );
}


function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppRoutes />
      </Router>
    </HelmetProvider>
  );
}


export default App;