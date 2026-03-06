import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LanguageProvider } from './utils/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import RepairRequest from './pages/RepairRequest';
import RepairRecords from './pages/RepairRecords';
import Settings from './pages/Settings';
import Notes from './pages/Notes';
import DocumentVault from './pages/DocumentVault';
import LegalAidFinder from './pages/LegalAidFinder';
import RentLedger from './pages/RentLedger';
import ConditionReport from './pages/ConditionReport';
import EmergencyDial from './pages/EmergencyDial';

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });
    }
  }, []);

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
            <Route path="legal-aid" element={<LegalAidFinder />} />
            <Route path="rent" element={<RentLedger />} />
            <Route path="condition" element={<ConditionReport />} />
            <Route path="emergency" element={<EmergencyDial />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
