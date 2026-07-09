import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import PanelistSidebar from '../components/panelist/PanelistSidebar'
import styles from './PanelistLayout.module.css'

/**
 * PanelistLayout — layout dùng chung cho vai trò Giảng viên (LECTURER),
 * bao gồm cả Mentor và Giám khảo. Cùng một khung giao diện — nội dung
 * bên trong hiển thị tuỳ theo vai trò được phân công.
 *
 * @param {ReactNode} children
 * @param {string}    [activePage]  — id item đang active (ghi đè auto-detect)
 * @param {function}  [onNavigate]  — callback(id) tuỳ biến điều hướng
 */
function PanelistLayout({ children, activePage: activePageProp, onNavigate }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Tự động xác định item đang active dựa trên URL hiện tại
  let currentActive = 'overview'
  if (location.pathname.includes('/contests')) currentActive = 'contests'

  const activePage = activePageProp ?? currentActive

  function handleNavigate(id) {
    if (onNavigate) {
      onNavigate(id)
      return
    }
    if (id === 'overview') navigate('/panelist/dashboard')
    else if (id === 'contests') navigate('/panelist/contests')
  }

  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null

  return (
    <div className={styles.root}>
      <Navbar
        isLoggedIn={true}
        user={userInfo ?? { name: 'Hội đồng', email: '', avatar: null }}
      />

      <div className={styles.body}>
        <PanelistSidebar activePage={activePage} onNavigate={handleNavigate} />

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}

export default PanelistLayout
