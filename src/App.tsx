import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Registration from './pages/Registration';
import Contact from './pages/Contact';
import ThankYou from './pages/ThankYou';
import Projects from './pages/Projects';
import CompletedProjects from './pages/CompletedProjects';
import FAQ from './pages/FAQ';
import ScrollToTop from './components/common/ScrollToTop';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects/current" element={<Projects />} />
            <Route path="/projects/completed" element={<CompletedProjects />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/thank-you" element={<ThankYou />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
