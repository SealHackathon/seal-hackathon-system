import { useState } from 'react'
import {
  ChartPieSlice,
  CalendarBlank,
  Star,
  Trophy,
  Megaphone,
  Users,
  Headset,
} from '@phosphor-icons/react'
import NavPill from '../Sidebar/NavPill'
import styles from './CoordinatorSidebar.module.css'

const NAV_GROUPS = [
  {
    items: [
      { id: 'overview', label: 'Tổng quan',  icon: ChartPieSlice },
      { id: 'schedule', label: 'Lịch trình', icon: CalendarBlank },
    ],
  },
  {
    label: 'Quản lí',
    items: [
      { id: 'events',   label: 'Sự kiện',              icon: Star },
      { id: 'rubric',   label: 'Tiêu chí chấm điểm', icon: Trophy },
      { id: 'notify',   label: 'Thông báo',            icon: Megaphone },
      { id: 'users',    label: 'Người dùng',           icon: Users },
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
  return (
    <aside className={`${styles.sidebar} ${'scrollbar'}`}>
      {NAV_GROUPS.map((group, gi) => (
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
                isActive={activePage === item.id}
                onClick={() => onNavigate?.(item.id)}
              />
            ))}
          </nav>
        </div>
      ))}
    </aside>
  )
}

export default CoordinatorSidebar
