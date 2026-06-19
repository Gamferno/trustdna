import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import TrustEvaluationPage from './pages/TrustEvaluationPage.jsx';
import TrustDecisionPage from './pages/TrustDecisionPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import VerificationPage from './pages/VerificationPage.jsx';
import SOCDashboardPage from './pages/SOCDashboardPage.jsx';
import HijackDashboardPage from './pages/HijackDashboardPage.jsx';
import ComparisonPage from './pages/ComparisonPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/evaluate/:scenarioId" element={<TrustEvaluationPage />} />
        <Route path="/decision" element={<TrustDecisionPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/hijack-dashboard" element={<HijackDashboardPage />} />
        <Route path="/verify/:method" element={<VerificationPage />} />
        <Route path="/soc" element={<SOCDashboardPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
      </Routes>
    </BrowserRouter>
  );
}
