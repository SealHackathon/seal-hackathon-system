import { createContext, useContext, useState } from "react";
import axiosClient from "./api/axiosClient";

const AuthContext = createContext(null);

// hàm kiểm tra token còn valid không
function isTokenValid() {
    const token = localStorage.getItem("accessToken");
    const expiredTime = localStorage.getItem("expiredTime");

    if (!token || !expiredTime) return false;

    return Date.now() < Number(expiredTime);
    //     ^ thời điểm hiện tại (ms)   ^ thời điểm hết hạn (ms)
}
export function AuthProvider({ children }) {
    const [role, setRole] = useState(() => isTokenValid() ? localStorage.getItem("role") : null);
    const [teamRole, setTeamRole] = useState(() => localStorage.getItem("teamRole") ?? null);
    const [activeAccount, setActiveAccount] = useState(() => localStorage.getItem("activeAccount") ?? null);
    const [userStatus, setUserStatus] = useState(() => localStorage.getItem("userStatus") ?? null);

    const [isAuthenticated, setIsAuthenticated] = useState(() => isTokenValid());

    const [userInfo, setUserInfo] = useState(() => {
        const stored = localStorage.getItem("userInfo");
        return stored ? JSON.parse(stored) : null;
    });
    const [teamRoleLoading, setTeamRoleLoading] = useState(false);

    // update userStatus
    const updateUserStatus = (newStatus) => {
        localStorage.setItem("userStatus", newStatus);
        setUserStatus(newStatus); // Dòng này sẽ kích hoạt React re-render toàn hệ thống
    };


    const fetchTeamRole = async () => {
        setTeamRoleLoading(true);
        try {
            const res = await axiosClient.get("/team/my-role");
            localStorage.setItem("teamRole", res.data);
            setTeamRole(res.data);
        } catch (err) {
            const fallback = err.response?.status === 404 ? "NO_TEAM" : null;
            localStorage.setItem("teamRole", fallback);
            setTeamRole(fallback);
        } finally {
            setTeamRoleLoading(false);
        }
    };

    const login = (loginResponse) => {
        localStorage.setItem("accessToken", loginResponse.token);
        localStorage.setItem("role", loginResponse.role);
        localStorage.setItem("activeAccount", loginResponse.activeAccount);
        localStorage.setItem("userStatus", loginResponse.status);

        //expired time đang set là 24h ở backend
        // login() trong AuthContext.jsx
        localStorage.setItem("expiredTime", String(Date.now() + loginResponse.expiredTime));
        setIsAuthenticated(true);
        const tr = loginResponse.teamRole;
        const resolvedTeamRole = tr && tr !== "" ? tr : "NO_TEAM";
        localStorage.setItem("teamRole", resolvedTeamRole);
        const info = { email: loginResponse.email, fullname: loginResponse.fullname };
        localStorage.setItem("userInfo", JSON.stringify(info));
        setRole(loginResponse.role ?? null);
        setTeamRole(resolvedTeamRole);
        setUserInfo(info);
        setActiveAccount(loginResponse.activeAccount)
        setUserStatus(loginResponse.status)

    };

    const clearAuth = () => {
        ["accessToken", "role", "teamRole", "userInfo", "expiredTime"].forEach(
            (key) => localStorage.removeItem(key)
        );
        setRole(null);
        setTeamRole(null);
        setUserInfo(null);
        setIsAuthenticated(false);
    };

    const logout = clearAuth; // logout gọi clearAuth

    return (
        <AuthContext.Provider value={{
            role,
            teamRole,
            teamRoleLoading,
            userInfo,
            userStatus
            ,
            activeAccount
            ,
            updateUserStatus,
            fetchTeamRole,
            login,
            logout,
            isAuthenticated: isAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}