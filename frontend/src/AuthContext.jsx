import { createContext, useContext, useState } from "react";
import axiosClient from "./api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [role, setRole] = useState(() => localStorage.getItem("role") ?? null);
    const [teamRole, setTeamRole] = useState(() => localStorage.getItem("teamRole") ?? null);
    const [userInfo, setUserInfo] = useState(() => {
        const stored = localStorage.getItem("userInfo");
        return stored ? JSON.parse(stored) : null;
    });
    const [teamRoleLoading, setTeamRoleLoading] = useState(false);

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
        const tr = loginResponse.teamRole;
        const resolvedTeamRole = tr && tr !== "" ? tr : "NO_TEAM";
        localStorage.setItem("teamRole", resolvedTeamRole);
        const info = { email: loginResponse.email, fullname: loginResponse.fullname };
        localStorage.setItem("userInfo", JSON.stringify(info));
        setRole(loginResponse.role ?? null);
        setTeamRole(resolvedTeamRole);
        setUserInfo(info);
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("teamRole");
        localStorage.removeItem("userInfo");
        setRole(null);
        setTeamRole(null);
        setUserInfo(null);
    };

    return (
        <AuthContext.Provider value={{
            role,
            teamRole,
            teamRoleLoading,
            userInfo,
            fetchTeamRole,
            login,
            logout,
            isAuthenticated: !!localStorage.getItem("accessToken"),
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}