import Navbar from '../components/Navbar/Navbar'
import Sidebar from '../components/Sidebar/Sidebar'
import styles from './EventLayout.module.css'

function EventLayout({ children }) {
  function handleGoBack() {
    // Note: Sau này gắn React Router vào thì đổi thành navigate('/')
    console.log('về dashboard')
  }
  const userInfo=localStorage.getItem('userInfo')? JSON.parse(localStorage.getItem('userInfo')): null

  return (
    <div className={styles.root}>
      <Navbar 
        isLoggedIn={true}
        user={{
          name:userInfo? userInfo.fullname : 'Nguyen Van A',
          email: userInfo? userInfo.email : 'nguyenvana@example.com',
          avatar: userInfo? userInfo.avatar : null
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