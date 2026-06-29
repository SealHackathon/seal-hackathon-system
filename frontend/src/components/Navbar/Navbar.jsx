import NotificationDropdown from "./NotificationDropdown";
import UserMenuDropdown from "./UserMenuDropdown";
import styles from './Navbar.module.css';
import Button from "../shared/Button";
import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import RegisterPage from "../../pages/RegisterPage";
// import LoginPage from "../../pages/LoginPage";
function Navbar({ isLoggedIn, user }) {

    const navigate = useNavigate();



    return (
        <div className={styles.wrapper}>
            <img
                className={styles.logo}
                src="/seal-hackathon-logo.svg"
                alt="SEAL Hackathon typography logo"
            />


            {/* chưa có chỗ để khởi động 2 button login  */}
            {/* nếu chưa login hiện navbar này -- ko thì hiện user menu dropdown */}
            <div className={styles.rightSection}>
                {!isLoggedIn ? (
                    <div className={styles.rightSectionContent}>
                        <Button
                            label="Đăng ký"
                            variant="primary"
                            color="green"
                            onClick={() => navigate("/register")}
                        />
                        <Button
                            label="Đăng nhập"
                            variant="outline"
                            onClick={() => navigate("/login")}
                        />
                    </div>
                ) : (
                    <div className={styles.rightSectionContent}>
                        <NotificationDropdown />
                        <UserMenuDropdown
                            name={user.name}
                            email={user.email}
                            avatar={user.avatar}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar;