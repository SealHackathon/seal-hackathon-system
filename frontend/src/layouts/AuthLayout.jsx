import Navbar from '../components/Navbar/Navbar'
import styles from './AuthLayout.module.css'

function AuthLayout({ children }) {
  return (
    <div className={styles.page}>
      <Navbar isLoggedIn={false} />

      <main className={styles.main}>
        <div className={styles.card}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default AuthLayout