import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ElectionList from './components/Elections/ElectionList';
import ElectionDetail from './components/Elections/ElectionDetail';
import AdminPanel from './components/Admin/AdminPanel';
import ProtectedRoute from './components/Common/ProtectedRoute';
import PublicResults from './components/Public/PublicResults';
import PublicElectionDetail from './components/Public/PublicElectionDetail';
import ObserverPanel from './components/Observer/ObserverPanel';
import ScrollToTop from './components/Common/ScrollToTop';

// Aquí va la parte que usa useAuth
function AppRoutes() {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return null; // o un loader global
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />            
      <Route path="/auditoria" element={<PublicResults />} />
      <Route path="/auditoria/election/:id" element={<PublicElectionDetail />} />
      
      {/* Protected Routes */}
      <Route path="/elections" element={
        <ProtectedRoute voterOnly> 
          <ElectionList />
        </ProtectedRoute>
      } />
      
      <Route path="/election/:id" element={
        <ProtectedRoute voterOnly>
          <ElectionDetail />
        </ProtectedRoute>
      } />
      
      {/* Admin Only Routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminPanel />
        </ProtectedRoute>
      } />

      <Route path="/observer" element={
        <ProtectedRoute observerOnly>
          <ObserverPanel />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={
        user?.role === 'Voter'
          ? <Navigate to="/elections" replace />
          : user?.role === 'Observer'
            ? <Navigate to="/observer" replace />
            : user?.role === 'Admin'
              ? <Navigate to="/admin" replace />
              : <Navigate to="/" replace />
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
