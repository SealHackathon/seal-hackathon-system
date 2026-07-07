import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import CoordinatorSidebar from '../components/coordinator/CoordinatorSidebar'
import styles from './CoordinatorLayout.module.css'

function CoordinatorLayout({
  children,
  defaultPage,
  activePage: activePageProp,
  onNavigate,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-detect active page from URL
  let currentActive = 'events'
  if (location.pathname.includes('/rubrics')) currentActive = 'rubric'

  const activePage = activePageProp ?? currentActive

  function handleNavigate(id) {
    if (onNavigate) {
      onNavigate(id)
    } else {
      if (id === 'events') navigate('/admin/coordinator/events')
      else if (id === 'rubric') navigate('/admin/coordinator/rubrics')
    }
  }

  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null

  return (
    <div className={styles.root}>
      <Navbar
        isLoggedIn={true}
        user={userInfo ?? { name: 'BTC', email: '', avatar: null }}
      />

      <div className={styles.body}>
        <CoordinatorSidebar
          activePage={activePage}
          onNavigate={handleNavigate}
        />

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default CoordinatorLayout
