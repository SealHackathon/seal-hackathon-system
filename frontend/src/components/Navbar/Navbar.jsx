import NotificationDropdown from "./NotificationDropdown";
import UserMenuDropdown from "./UserMenuDropdown";
import styles from './Navbar.module.css';
import Button from "../shared/Button"; 

function Navbar({ isLoggedIn, user }) {
    return (
        <div className={styles.wrapper}>
            <img
                className={styles.logo}
                src="/seal-hackathon-logo.svg"
                alt="SEAL Hackathon typography logo"
            />

            <div className={styles.rightSection}>
                {!isLoggedIn ? (
                    <div className={styles.rightSectionContent}>
                        <Button
                            label="Đăng ký"
                            variant="primary"
                            color="green"
                        />
                        <Button
                            label="Đăng nhập"
                            variant="outline"
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