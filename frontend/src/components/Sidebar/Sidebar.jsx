import { useState } from 'react'
import { Flag, UsersThree, UploadSimple, ArrowLeft } from '@phosphor-icons/react'
import NavPill from './NavPill'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { id: 'event', label: 'Cuộc thi', icon: Flag },
  { id: 'team', label: 'Đội thi của bạn', icon: UsersThree },
  { id: 'submit', label: 'Nộp bài dự thi', icon: UploadSimple },
]

function Sidebar({ onGoBack }) {
  const [activePage, setActivePage] = useState('team') // !  Set tạm
  return (
    //TODO: gắn mấy cái nút chuyển hướng vô đây
    <aside className={`${styles.sidebar} ${'scrollbar'}`}>

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
  )
}

export default Sidebar