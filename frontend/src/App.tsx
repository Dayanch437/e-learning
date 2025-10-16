import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { ResponsiveProvider } from './components/Utils/ResponsiveProvider';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Layout/SimpleLayout';
import Dashboard from './components/Dashboard';
import GrammarList from './components/Grammar/SimpleGrammarList';
import GrammarDetail from './components/Grammar/SimpleGrammarDetail';
import VideoList from './components/Videos/SimpleVideoList';
import VideoDetail from './components/Videos/SimpleVideoDetail';
import VocabularyList from './components/Vocabulary/SimpleVocabularyList';
import SimpleChat from './components/Chat/SimpleChat';
import { CategoryManagement } from './components/Categories';
import APIConnectionTester from './components/Debug/APIConnectionTester';
import 'antd/dist/reset.css';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <ResponsiveProvider>
        <AuthProvider>
          <Router>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="grammar" element={<GrammarList />} />
              <Route path="grammar/:id" element={<GrammarDetail />} />
              <Route path="videos" element={<VideoList />} />
              <Route path="videos/:id" element={<VideoDetail />} />
              <Route path="vocabulary" element={<VocabularyList />} />
              <Route path="chat" element={<SimpleChat />} />
              <Route path="categories" element={
                <ProtectedRoute requiredRole="admin">
                  <CategoryManagement />
                </ProtectedRoute>
              } />
              <Route path="api-test" element={
                <ProtectedRoute requiredRole="admin">
                  <APIConnectionTester />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
          </Router>
        </AuthProvider>
      </ResponsiveProvider>
    </ConfigProvider>
  );
};

export default App;