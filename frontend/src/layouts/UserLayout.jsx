import Navbar from '../components/Navbar/Navbar'
import styles from './UserLayout.module.css'
import { useAuth } from '../AuthContext'

function UserLayout({ children, showCard = true }) {
    const { userInfo } = useAuth()

    return (
        <div className={styles.page}>
            <Navbar
                isLoggedIn={true}
                user={{
                    name: userInfo?.fullname ?? 'Nguyen Van A',
                    email: userInfo?.email ?? 'nguyenvana@example.com',
                    avatar: userInfo?.avatar ?? null
                }}
            />
            <main className={styles.main}>
                {showCard
                    ? <div className={styles.card}>{children}</div>
                    : children
                }
            </main>
        </div>
    )
}

export default UserLayout