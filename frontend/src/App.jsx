

// import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
// import './App.css'
// import { useState, useEffect } from 'react';
// import axiosClient from "./api/axiosClient";
// import LeaderView from './pages/LeaderView'
// import MemberView from './pages/MemberView'
// import NoTeamViews from './pages/NoTeamView';
// import LoginPage from './pages/LoginPage';
// import UserDashboard from './pages/UserDashboard';

// import EventListPage from './pages/EventListPage';
// import CreateEventPage from './pages/coordinator/events/create/CreateEventPage';
// function App() {


//   const [role, setRole] = useState(null);
//   const token = localStorage.getItem("accessToken");
//   const [screen, setScreen] = useState(localStorage.getItem('screen') || 'dashboard')
//     return (
//     <BrowserRouter>
//       <Routes>
//         {/* ================= LUỒNG ĐIỀU HƯỚNG SỰ KIỆN (COORDINATOR) ================= */}
//         {/* Trang danh sách sự kiện */}
//         <Route path="/coordinator/events" element={<EventListPage />} />

//         {/* Trang tạo sự kiện mới */}
//         <Route path="/coordinator/events/create" element={<CreateEventPage />} />

//         {/* Trang quản lý/chỉnh sửa một sự kiện cụ thể */}
//         <Route path="/coordinator/events/manage/:id" element={<CreateEventPage />} />


//         {/* ================= LUỒNG DASHBOARD VÀ PHÂN QUYỀN TEAM ================= */}
//         {/* Trang chủ Dashboard của User */}
//         <Route path="/dashboard" element={<UserDashboard />} />

//         {/* Route kiểm tra động view Team tùy theo Role của bạn dưới DB */}
//         <Route path="/team" element={
//           role === "LEADER" ? <LeaderView /> :
//             role === "MEMBER" ? <MemberView /> : <NoTeamViews />
//         } />
//         <Route path="*" element={<Navigate to="/coordinator/events" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );


//   // function navigate(page) {
//   //   localStorage.setItem('screen', page)
//   //   setScreen(page)
//   // }

//   // useEffect(() => {
//   //   axiosClient
//   //     .get("/team/my-role")
//   //     .then((res) => {
//   //       setRole(res.data);
//   //     })
//   //     .catch((err) => {
//   //       if (err.response?.status === 404) {
//   //         setRole("UNAUTHORIZED");
//   //       }
//   //     });
//   // }, [token]);
//   // if (!token) {
//   //   return <LoginPage />;
//   // }
//   // if (screen === 'team') {
//   //   if (role === "LEADER") {
//   //     return <LeaderView />
//   //   }
//   //   if (role === 'MEMBER') {
//   //     return <MemberView />
//   //   }
//   //   else {
//   //     return <NoTeamViews />
//   //   }
//   // }

//   // return <UserDashboard onNavigate={navigate} />



// }

// export default App



import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './AuthContext';

import LeaderView from './pages/LeaderView';
import MemberView from './pages/MemberView';
import NoTeamView from './pages/NoTeamView';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import EventListPage from './pages/EventListPage';
import CreateEventPage from './pages/coordinator/events/create/CreateEventPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import CompleteProfilePage from './pages/completeProfile/CompleteProfilePage';
import EmailVerifiedPage from './pages/EmailVerifiedPage';


function TeamRoute() {
    const { role, teamRole, teamRoleLoading, fetchTeamRole, fetchUserStatus } = useAuth();

    useEffect(() => {
        fetchTeamRole();
        fetchUserStatus();
    }, []);

    if (role !== "USER") return <Navigate to="/admin/coordinator/events" replace />;
    if (teamRoleLoading) return <div>Loading...</div>;
    if (teamRole === null) return <div>Loading...</div>;
    if (teamRole === "LEADER") return <LeaderView />;
    if (teamRole === "MEMBER") return <MemberView />;
    return <NoTeamView />;
}



function AppRoutes() {
    const { role, isAuthenticated, userStatus,fetchUserStatus } = useAuth();
    // console.log(userStatus)
    // console.log(teamRole)
      useEffect(() => {
        fetchUserStatus();
    }, []);

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verified-email" element={<EmailVerifiedPage />} />


            {/* <Route path="/user/dashboard" element={<UserDashboard />} /> */}

            {/* <Route path="/complete-profile" element={<CompleteProfilePage />} /> */}

            {isAuthenticated ? (
                <>
                    {role === "ADMIN" && (
                        <>
                            <Route path="/admin/coordinator/events" element={<EventListPage />} />
                            <Route path="/admin/coordinator/events/create" element={<CreateEventPage />} />
                        </>
                    )}


                    {role === "USER" && (

                        <>

                            {console.log(userStatus)}
                         //todo
                            // tạm thời hard code để PENDING_APPROVAL vào DASH BOARD        
                            {console.log(userStatus)}
                            {/* <Route

                                path="/user/dashboard"
                                element={userStatus === "PENDING_APPROVAL" ? <UserDashboard /> : <CompleteProfilePage />}
                            /> */}


                            <Route
                                path="/user/dashboard"
                                element={userStatus === "PROFILE_PENDING" ? <Navigate to="/user/complete-profile" replace /> : <UserDashboard />}
                            />

                            {/* Chặn luôn trang /team nếu chưa được duyệt tài khoản (Tùy chọn nhưng nên làm) */}
                            <Route
                                path="/team"
                                element={
                                    userStatus === "PROFILE_PENDING" ? (
                                        <Navigate to="/user/complete-profile" replace />
                                    ) : userStatus === "PENDING_APPROVAL" ? (
                                        <Navigate to="/user/dashboard" replace />
                                    ) : (
                                        <TeamRoute />
                                    )
                                }
                            />

                            {/* Trang chỉnh sửa thông tin thực sự */}
                            <Route path="/user/complete-profile" element={<CompleteProfilePage />} />
                        </>
                    )}

                    <Route path="*" element={
                        <Navigate to={role === "ADMIN" ? "/admin/coordinator/events" : "/user/dashboard"} replace />
                    } />
                </>
            ) : (
                <Route path="*" element={<Navigate to="/login" replace />} />
            )}
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;