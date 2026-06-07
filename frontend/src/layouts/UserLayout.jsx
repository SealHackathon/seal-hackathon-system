import Navbar from '../components/Navbar/Navbar'
import styles from './UserLayout.module.css'

const FAKE_USER = {
  name: 'Nguyễn Thành Thái',
  avatarUrl: null,
}

function UserLayout({ children, showCard = true }) {
    return (
        <div className={styles.page}>
            <Navbar isLoggedIn={true} user={FAKE_USER} />
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