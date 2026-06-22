import Navbar from '../components/Navbar/Navbar'
import styles from './UserLayout.module.css'

const userInfo=localStorage.getItem('userInfo')? JSON.parse(localStorage.getItem('userInfo')): null

function UserLayout({ children, showCard = true }) {
    return (
        <div className={styles.page}>
            <Navbar 
        isLoggedIn={true}
        user={{
          name:userInfo? userInfo.fullname : 'Nguyen Van A',
          email: userInfo? userInfo.email : 'nguyenvana@example.com',
          avatar: userInfo? userInfo.avatar : null
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