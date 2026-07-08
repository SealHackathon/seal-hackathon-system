

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
import Lenis from 'lenis';
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
import RubricLibraryPage from './pages/coordinator/rubrics/RubricLibraryPage';
import CreateRubricPage from './pages/coordinator/rubrics/CreateRubricPage';
import SubmissionPage from './pages/SubmissionPage';
import RoundSubmissionDetailPage from './pages/RoundSubmissionDetailPage';
import PanelistDashboard from './pages/panelist/DashboardPage';


function TeamRoute() {
    const { role, teamRole, teamRoleLoading, fetchTeamRole } = useAuth();

    useEffect(() => {
        fetchTeamRole();
    }, []);

    if (role !== "USER") return <Navigate to="/admin/coordinator/events" replace />;
    if (teamRoleLoading) return <div>Loading...</div>;
    if (teamRole === null) return <div>Loading...</div>;

    if (teamRole === "LEADER") return <LeaderView />;

    if (teamRole === "MEMBER") return <MemberView />;

    return <NoTeamView />;
}




function AppRoutes() {
    const { role, isAuthenticated, userStatus, fetchUserStatus } = useAuth();
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
                            <Route path="/admin/coordinator/events/manage/:id" element={<CreateEventPage />} />
                            <Route path="/admin/coordinator/rubrics" element={<RubricLibraryPage />} />
                            <Route path="/admin/coordinator/rubrics/create" element={<CreateRubricPage />} />
                            <Route path="/admin/coordinator/rubrics/:id/edit" element={<CreateRubricPage />} />

                        </>
                    )}


                    {role === "USER" && (
                        <>
                            {userStatus === "PROFILE_PENDING" ? (
                                // User chưa hoàn thiện hồ sơ -> Chỉ cho phép ở trang complete-profile
                                <>
                                    <Route path="/user/complete-profile" element={<CompleteProfilePage />} />
                                    <Route path="*" element={<Navigate to="/user/complete-profile" replace />} />
                                </>
                            ) : (
                                // User đã hoàn thiện hồ sơ -> Các trang bình thường
                                <>
                                    <Route path="/user/dashboard" element={<UserDashboard />} />

                                    <Route path="/team" element={
                                        userStatus === "PENDING_APPROVAL" ? (
                                            <Navigate to="/user/dashboard" replace />
                                        ) : (
                                            <TeamRoute />
                                        )
                                    } />
                                    
                                    <Route path="/team/submissions" element={
                                        userStatus === "PENDING_APPROVAL" ? (
                                            <Navigate to="/user/dashboard" replace />
                                        ) : (
                                            <SubmissionPage />
                                        )
                                    } />

                                    <Route path="/team/submissions/detail" element={
                                        userStatus === "PENDING_APPROVAL" ? (
                                            <Navigate to="/user/dashboard" replace />
                                        ) : (
                                            <RoundSubmissionDetailPage />
                                        )
                                    } />

                                    {/* Không cho phép quay lại complete-profile nếu đã xong */}
                                    <Route path="/user/complete-profile" element={<Navigate to="/user/dashboard" replace />} />
                                    <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
                                </>
                            )}
                        </>
                    )}

                    {/* LUONG GIANG VIEN (LECTURER = Mentor & Giam khao) */}
                    {role === "LECTURER" && (
                        <>
                            <Route path="/panelist/dashboard" element={<PanelistDashboard />} />
                            {/* TODO: <Route path="/panelist/contests" element={<ContestsPage />} /> */}
                            <Route path="*" element={<Navigate to="/panelist/dashboard" replace />} />
                        </>
                    )}

                    {role === "ADMIN" && (
                        <Route path="*" element={<Navigate to="/admin/coordinator/events" replace />} />
                    )}
                </>
            ) : (
                <Route path="*" element={<Navigate to="/login" replace />} />
            )}
        </Routes>
    );
}

function SmoothScroll({ children }) {
    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true,
            lerp: 0.25, // Tốc độ nội suy nhanh, không bị hiệu ứng slow-motion
        });
        return () => {
            lenis.destroy();
        };
    }, []);
    return children;
}

function App() {
    return (
        <SmoothScroll>
            <AuthProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </AuthProvider>
        </SmoothScroll>
    );
}

export default App;