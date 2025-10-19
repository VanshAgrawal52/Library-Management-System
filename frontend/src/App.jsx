import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Home from './pages/home.jsx';
import Login from './pages/login.jsx';
import Dashboard from './pages/dashboard.jsx';
import User from './pages/user.jsx';
import Register from './pages/register.jsx';
import Navbar from "./components/navbar.jsx";
import HideRoute from './components/hideRoutes.jsx';
import AdminPanel from './pages/adminPanel.jsx';
import ForgotPasswordPage from './pages/forgetPasswordPage.jsx';
import AnalyticsPage from './pages/analyticsPage.jsx';

function App() {
  return (
    <Router>
      <HideRoute />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user" element={<User />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adminPanel" element={<AdminPanel />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Router>
  );
}

export default App;