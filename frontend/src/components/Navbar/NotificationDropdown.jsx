import { useState, useRef, useEffect } from 'react'
import { Bell } from '@phosphor-icons/react'
import NotificationItem from './NotificationItem'
import styles from './NotificationDropdown.module.css'

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  // Click ra ngoài thì đóng dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        type='button'
      >
        <Bell size={36} color="white" weight='fill' />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <h3 className={styles.title}>Thông báo</h3>
          <NotificationItem
            message="Đội SEAL Hackers đã chấp nhận yêu cầu của bạn."
            time="2 giờ trước"
            isUnread={true}
          />
          <NotificationItem
            message="Nguyễn Thành Thái đã mời bạn vào đội."
            time="1 ngày trước"
            isUnread={false}
          />
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown