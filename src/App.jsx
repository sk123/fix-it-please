import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './utils/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import RepairRequest from './pages/RepairRequest';
import RepairRecords from './pages/RepairRecords';
import Settings from './pages/Settings';
import Notes from './pages/Notes';
import DocumentVault from './pages/DocumentVault';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="repair" element={<RepairRequest />} />
            <Route path="records" element={<RepairRecords />} />
            <Route path="vault" element={<DocumentVault />} />
            <Route path="notes" element={<Notes />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
