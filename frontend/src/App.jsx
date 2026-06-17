// <<<<<<< HEAD

import './App.css'
import { useState, useEffect } from 'react';
import axios from 'axios';
import LeaderView from './pages/LeaderView'
import MemberView from './pages/MemberView'
import NoTeamViews from './pages/NoTeamView';
import LoginPage from './pages/LoginPage';
import JoinTeamFlow from './components/joinFlow/JoinTeamFlow';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [role, setRole] = useState(null);
  const token = localStorage.getItem("accessToken");
  const [screen, setScreen] = useState(localStorage.getItem('screen') || 'dashboard')

  function navigate(page) {
    localStorage.setItem('screen', page)
    setScreen(page)
  }

  // Check if admin mode (for demo purposes)
  const isAdminMode = localStorage.getItem('adminMode') === 'true';
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminView = urlParams.get('admin') === 'true';

  // Show admin dashboard if admin view is requested (demo mode) - NO TOKEN NEEDED
  if (isAdminView) {
    return <AdminDashboard />;
  }

  useEffect(() => {
    if (!token) return; // Don't fetch if no token
    
    axios
      .get("http://localhost:8080/api/team/my-role", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRole(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setRole("UNAUTHORIZED");
        }
      });
  }, [token]);
  
  if (!token) {
    return <LoginPage />;
  }

  // Show admin dashboard if admin mode is enabled
  if (isAdminMode) {
    return <AdminDashboard />;
  }

  if (screen === 'team') {
    if (role === "LEADER") {
      return <LeaderView />
    }
    if (role === 'MEMBER') {
      return <MemberView />
    }
    else {
      return <NoTeamViews />
    }
  }

  return <UserDashboard onNavigate={navigate} />

}

export default App
