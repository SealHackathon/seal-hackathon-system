// <<<<<<< HEAD

import './App.css'
import { useState, useEffect } from 'react';
import axios from 'axios';
import LeaderView from './pages/LeaderView'
import MemberView from './pages/MemberView'
import NoTeamViews from './pages/NoTeamView';
import LoginPage from './pages/LoginPage';
import JoinTeamFlow from './components/joinFlow/JoinTeamFlow';
function App() {
  const [role, setRole] = useState(null);
  const token = localStorage.getItem("accessToken");

  

  useEffect(() => {
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
  if (role === "LEADER") {
    return <LeaderView />;
  }else if(role==='MEMBER')
   {
    return <MemberView />;
  }else{
    return <NoTeamViews />;
  }

 

}

export default App