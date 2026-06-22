import { useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import CoordinatorSidebar from '../components/coordinator/CoordinatorSidebar'
import styles from './CoordinatorLayout.module.css'

/**
 * CoordinatorLayout
 * 
 *
 * @param {React.ReactNode} children
 * @param {string}          [defaultPage]  — trang mặc định khi load (default: 'events')
 * @param {string}          [activePage]   — nếu muốn control từ bên ngoài
 * @param {function}        [onNavigate]   — callback(id) khi đổi trang
 */
function CoordinatorLayout({
  children,
  defaultPage = 'events',
  activePage: activePageProp,
  onNavigate,
}) {
  // Hỗ trợ cả uncontrolled (tự quản state) và controlled (nhận từ bên ngoài)
  const [internalPage, setInternalPage] = useState(defaultPage)
  const activePage = activePageProp ?? internalPage

  function handleNavigate(id) {
    if (!activePageProp) setInternalPage(id)
    onNavigate?.(id)
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
