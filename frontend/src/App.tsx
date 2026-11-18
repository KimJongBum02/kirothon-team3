import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CertificateListPage from './pages/CertificateListPage';
import CertificateDetailPage from './pages/CertificateDetailPage';
import StudyPlanPage from './pages/StudyPlanPage';
import PracticePage from './pages/PracticePage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CertificateListPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/certificates/:certificateId" element={<CertificateDetailPage />} />
          <Route path="/certificates/:certificateId/plan" element={<StudyPlanPage />} />
          <Route path="/certificates/:certificateId/practice" element={<PracticePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
