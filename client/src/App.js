import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import ProfilePage from './views/ProfilePage';
import AdminPanelPage from './views/AdminPanelPage';
import LiveStreamPage from './views/LiveStreamPage';
import CoursesPage from './views/CoursesPage';
import QAPage from './views/QAPage';
import QuestionDetailPage from './views/QuestionDetailPage';
import LiveChatPage from './views/LiveChatPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <QAPage />
          </PrivateRoute>
        } />
        <Route path="/qa" element={<QAPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/admin" element={<AdminPanelPage />} />
        <Route path="/canli-yayin" element={
          <PrivateRoute>
            <LiveStreamPage />
          </PrivateRoute>
        } />
        <Route path="/livechat" element={
          <PrivateRoute>
            <LiveChatPage />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
