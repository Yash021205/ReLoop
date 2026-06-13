import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ReturnFormPage from './pages/ReturnFormPage';
import ImageUploadPage from './pages/ImageUploadPage';
import QuestionsPage from './pages/QuestionsPage';
import ResultsDashboardPage from './pages/ResultsDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/return" element={<ReturnFormPage />} />
        <Route path="/upload" element={<ImageUploadPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/results" element={<ResultsDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
