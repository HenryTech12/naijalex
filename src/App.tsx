import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { Landing } from './pages/Landing';
import { Analyze } from './pages/Analyze';
import { Analysis } from './pages/Analysis';
import { Explorer } from './pages/Explorer';
import { History } from './pages/History';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Landing />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/analysis/:analysisId" element={<Analysis />} />
          <Route path="/history/:userId" element={<History />} />
          <Route path="/history/:userId/:analysisId" element={<Analysis />} />
          <Route path="/explorer" element={<Explorer />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1916',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#1D9E75', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#E24B4A', secondary: '#fff' },
          },
        }}
      />
    </AppProvider>
  );
}

export default App;
