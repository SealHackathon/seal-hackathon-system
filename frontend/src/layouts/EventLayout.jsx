import Navbar from '../components/Navbar/Navbar'
import Sidebar from '../components/sidebar/Sidebar'
import styles from './EventLayout.module.css'

function EventLayout({ children }) {
  function handleGoBack() {
    // Note: Sau này gắn React Router vào thì đổi thành navigate('/')
    console.log('về dashboard')
  }

  return (
    <div className={styles.root}>
      <Navbar 
        isLoggedIn={true}
        user={{
          name: 'Nguyễn Thành Thái',
          email: 'ntbi533@gmail.com',
          avatar: null
        }}

      />

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