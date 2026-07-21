import Navbar from '../components/Navbar/Navbar'
import styles from './UserLayout.module.css'
import { useAuth } from '../AuthContext'

// const userInfo=localStorage.getItem('userInfo')? JSON.parse(localStorage.getItem('userInfo')): null

function UserLayout({ children, showCard = true, fullWidth = false }) {
    const { userInfo } = useAuth()

    return (
        <div className={[styles.page, fullWidth ? styles.fullWidth : ''].join(' ')}>
            <Navbar
                isLoggedIn={!!userInfo}
                user={userInfo ? {
                    name: userInfo.fullname,
                    email: userInfo.email,
                    avatar: userInfo.avatar
                } : null} />
            <main className={[styles.main, fullWidth ? styles.fullWidth : ''].join(' ')}>
                {showCard
                    ? <div className={styles.card}>{children}</div>
                    : children}
            </main>
        </div>
    )
}

export default UserLayout