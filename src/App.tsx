import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeProvider } from './components/ThemeProvider';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Careers = lazy(() => import('./pages/Careers'));
const Projects = lazy(() => import('./pages/Projects'));
const CompletedProjects = lazy(() => import('./pages/CompletedProjects'));
const Registration = lazy(() => import('./pages/Registration'));
const Contact = lazy(() => import('./pages/Contact'));
const ThankYou = lazy(() => import('./pages/ThankYou'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading...</p>
    </div>
  </div>
);

const PageSkeleton = () => (
  <div className="pt-24 pb-20 bg-brand-bg dark:bg-gray-900 min-h-screen">
    <div className="container mx-auto px-4">
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mx-auto" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/projects/current" element={<Projects />} />
                <Route path="/projects/completed" element={<CompletedProjects />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
