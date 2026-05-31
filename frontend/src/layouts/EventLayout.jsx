import Navbar from '../components/navbar/Navbar'
import Sidebar from '../components/sidebar/Sidebar'
import styles from './EventLayout.module.css'

function EventLayout({ children }) {
  function handleGoBack() {
    // Note: Sau này gắn React Router vào thì đổi thành navigate('/')
    console.log('về dashboard')
  }

  return (
    <div className={styles.root}>
      <Navbar />

      <div className={styles.body}>
        <Sidebar onGoBack={handleGoBack} />

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default EventLayout