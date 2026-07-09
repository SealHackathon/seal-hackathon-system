import { useState, useRef, useEffect } from 'react'
import { Flag, UsersThree, UploadSimple, ArrowLeft } from '@phosphor-icons/react'
import NavPill from './NavPill'
import styles from './Sidebar.module.css'
import { useNavigate } from "react-router-dom";
const NAV_ITEMS = [
  { id: 'event', label: 'Cuộc thi', icon: Flag },
  { id: 'team', label: 'Đội thi của bạn', icon: UsersThree },
  { id: 'submit', label: 'Nộp bài dự thi', icon: UploadSimple },
]

function Sidebar({ onGoBack }) {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('team') // !  Set tạm

  const [isSticky, setIsSticky] = useState(false)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { rootMargin: '-96px 0px 0px 0px', threshold: 0 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} className={styles.sidebarSentinel} />
      <aside className={`${styles.sidebar} ${'scrollbar'} ${isSticky ? styles.sidebarSticky : ''}`}>

        <button className={styles.backBtn} onClick={onGoBack}>
          <ArrowLeft size={24} />
          <span>Trang chủ</span>
        </button>

        <hr className={styles.divider} />

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <NavPill
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activePage === item.id}
              onClick={() => setActivePage(item.id)}
            />
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar