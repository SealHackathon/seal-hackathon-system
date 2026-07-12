import { useState, useRef, useEffect } from 'react'
import { SquaresFour, Flag } from '@phosphor-icons/react'
import NavPill from '../Sidebar/NavPill'
import styles from './PanelistSidebar.module.css'

// Sidebar của Giảng viên (Mentor & Giám khảo) — chỉ gồm 2 mục điều hướng chính
const NAV_GROUPS = [
  {
    items: [
      { id: 'overview', label: 'Tổng quan', icon: SquaresFour },
      { id: 'contests', label: 'Cuộc thi của bạn', icon: Flag },
    ],
  },
]

/**
 * PanelistSidebar — sidebar dùng chung cho Giảng viên (Mentor & Giám khảo).
 *
 * @param {string}   activePage — id item đang active
 * @param {function} onNavigate — callback(id)
 */
function PanelistSidebar({ activePage, onNavigate }) {
  const [isSticky, setIsSticky] = useState(false)
  const sentinelRef = useRef(null)

  // Theo dõi mốc sentinel để bật chế độ sticky khi cuộn qua Navbar
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
      <aside className={`${styles.sidebar} ${isSticky ? styles.sidebarSticky : ''}`}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <hr className={styles.divider} />}
            {group.label && <p className={styles.groupLabel}>{group.label}</p>}
            <nav className={styles.nav}>
              {group.items.map((item) => (
                <NavPill
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={activePage === item.id}
                  onClick={() => onNavigate?.(item.id)}
                />
              ))}
            </nav>
          </div>
        ))}
      </aside>
    </>
  )
}

export default PanelistSidebar
