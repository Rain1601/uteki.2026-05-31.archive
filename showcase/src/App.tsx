import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import NewsTimelinePage from './pages/NewsTimelinePage';
import AgentChatPage from './pages/AgentChatPage';
import CompanyAgentStudio from './pages/CompanyAgentStudio';
import MarketDashboardPage from './pages/MarketDashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Layout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="news-timeline" element={<NewsTimelinePage />} />
        <Route path="agent" element={<AgentChatPage />} />
        <Route path="company-agent" element={<CompanyAgentStudio />} />
        <Route path="macro/market-dashboard" element={<MarketDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
