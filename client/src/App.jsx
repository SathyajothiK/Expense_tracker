import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import { CurrencyProvider } from './context/CurrencyContext';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <CurrencyProvider>
      <Router>
        <Routes>
          <Route path="/"            element={<Login />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Login />} />
          <Route path="/contact"     element={<Contact />} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analytics"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/budget"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CurrencyProvider>
  );
}

export default App;
