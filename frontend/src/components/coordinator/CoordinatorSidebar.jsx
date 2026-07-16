import { useState, useRef, useEffect, useMemo } from 'react'
import {
  ChartPieSlice,
  CalendarBlank,
  Star,
  Clipboard,
  Megaphone,
  Users,
  Headset,
} from '@phosphor-icons/react'
import NavPill from '../Sidebar/NavPill'
import styles from './CoordinatorSidebar.module.css'
import axiosClient from '../../api/axiosClient'

const NAV_GROUPS = [
  {
    items: [
      { id: 'overview', label: 'Tổng quan',  icon: ChartPieSlice },
      // { id: 'schedule', label: 'Lịch trình', icon: CalendarBlank },
    ],
  },
  {
    label: 'Quản lí',
    items: [
      { id: 'events',   label: 'Sự kiện',              icon: Star },
      { id: 'rubric',   label: 'Bộ tiêu chí',          icon: Clipboard },
      { id: 'candidates', label: 'Duyệt hồ sơ',        icon: Users },
      // { id: 'notify',   label: 'Thông báo',            icon: Megaphone },
      // { id: 'users',    label: 'Người dùng',           icon: Users },
    ],
  },
  {
    label: 'Hỗ trợ',
    items: [
      { id: 'requests', label: 'Xử lý yêu cầu', icon: Headset },
    ],
  },
]

/**
 * CoordinatorSidebar
 * 
 *
 * @param {string}   activePage   — id của item đang active
 * @param {function} onNavigate   — callback(id)
 */
function CoordinatorSidebar({ activePage, onNavigate }) {
  const [isSticky, setIsSticky] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const sentinelRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { rootMargin: '-96px 0px 0px 0px', threshold: 0 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await axiosClient.get('/user/user-info')
        const list = res.data?.body ?? res.data ?? []
        const count = list.filter(u => {
          const st = u.accoutStatus
          return st === 'PROFILE_PENDING' || st === 'PENDING_APPROVAL' || !st
        }).length
        setPendingCount(count)
      } catch (err) {
        console.error('Failed to fetch candidates count', err)
      }
    }
    fetchPendingCount()
  }, [])

  const groups = useMemo(() => {
    return NAV_GROUPS.map(group => ({
      ...group,
      items: group.items.map(item => {
        if (item.id === 'candidates') {
          return { ...item, badge: pendingCount > 0 ? pendingCount : null }
        }
        return item
      })
    }))
  }, [pendingCount])

  return (
    <>
      <div ref={sentinelRef} className={styles.sidebarSentinel} />
      <aside className={`${styles.sidebar} ${isSticky ? styles.sidebarSticky : ''}`}>
      {groups.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && <hr className={styles.divider} />}
          {group.label && (
            <p className={styles.groupLabel}>{group.label}</p>
          )}
          <nav className={styles.nav}>
            {group.items.map(item => (
              <NavPill
                key={item.id}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
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

export default CoordinatorSidebar
