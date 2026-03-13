import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './components/Login';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-cyan-950 text-slate-100 font-rajdhani overflow-hidden selection:bg-cyan-500/40">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin-hidden-panel" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
