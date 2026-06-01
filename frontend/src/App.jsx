
import './App.css'
import { useState, useEffect } from 'react';
import axios from 'axios';
import LeaderView from './pages/LeaderView'
import MemberView from './pages/MemberView'
import { useNavigate } from 'react-router-dom';
function App() {
  const navigate = useNavigate();
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
        // Không có role => MEMBER
        if (err.response?.status === 404) {
          setRole("MEMBER");
        } else {
          setRole("UNAUTHORIZED");
        }
      });
  }, [token]);
  if (!token) {
    navigate("/");
  }
  if (role === "LEADER") {
    return <LeaderView />;
  }
  else {
    return <MemberView />;
  }

}


export default App
