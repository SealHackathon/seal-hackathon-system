import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Sidebar from '../components/Sidebar/Sidebar'
import styles from './EventLayout.module.css'

function EventLayout({
  children,
  defaultPage,
  activePage: activePageProp,
  onNavigate,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-detect active page from URL
  let currentActive = 'team'
  if (location.pathname.includes('/team/submissions')) currentActive = 'submit'

  const activePage = activePageProp ?? currentActive

  function handleNavigate(id) {
    if (onNavigate) {
      onNavigate(id)
    } else {
      if (id === 'team') navigate('/team')
      else if (id === 'submit') navigate('/team/submissions')
      else navigate('/user/dashboard')
    }
  }

  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null

  return (
    <div className={styles.root}>
      <Navbar
        isLoggedIn={true}
        user={{
          name: userInfo ? userInfo.fullname : 'Nguyen Van A',
          email: userInfo ? userInfo.email : 'nguyenvana@example.com',
          avatar: userInfo ? userInfo.avatar : null
        }}

      />

      <div className={styles.body}>
        <Sidebar activePage={activePage} onNavigate={handleNavigate} />

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default EventLayout