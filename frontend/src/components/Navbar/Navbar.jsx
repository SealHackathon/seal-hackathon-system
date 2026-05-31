import NotificationDropdown from "./NotificationDropdown";
import UserMenuDropdown from "./UserMenuDropdown";
import styles from './Navbar.module.css'


function Navbar() {
    return (

            <div className={styles.wrapper}>
                <img
                    className={styles.logo} 
                    src="/seal-hackathon-logo.svg" 
                    alt="SEAL Hackathon typography logo" 
                />

                <NotificationDropdown />
                <UserMenuDropdown
                    name="Nguyen Thanh Thai"
                    email="ntbi533@gmail.com"
                    avatar={null}
                />
            </div>

    )
}


export default Navbar;