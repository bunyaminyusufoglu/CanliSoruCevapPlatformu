import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import LiveChatPage from './views/LiveChatPage';
import ProfilePage from './views/ProfilePage';
import AdminPanelPage from './views/AdminPanelPage';
import LiveStreamPage from './views/LiveStreamPage';
import QuestionList from './components/QuestionList';
import QuestionDetail from './components/QuestionDetail';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/livechat" element={<LiveChatPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
            <Route path="/courses" element={
              <PrivateRoute>
                <LiveStreamPage />
              </PrivateRoute>
            } />
            {/* Soru-Cevap Sistemi Rotaları */}
            <Route path="/questions" element={<QuestionList />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
