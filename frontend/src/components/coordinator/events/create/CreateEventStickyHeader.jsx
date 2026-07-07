import { ArrowLeft, Clock } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import useSticky from '../../../../hooks/useSticky'
import styles from './CreateEventStickyHeader.module.css'

function CreateEventStickyHeader({ isEditing, lastUpdated }) {
  const navigate = useNavigate()
  const [sentinelRef, isSticky] = useSticky('-1px 0px 0px 0px')

  return (
    <>
      <div ref={sentinelRef} />
      <header className={`${styles.header} ${isSticky ? styles.isStuck : ''}`}>
        <div className={styles.container}>
          <div className={styles.left}>
            <button
              className={styles.backLink}
              onClick={() => navigate('/admin/coordinator/events')}
              title="Quay lại danh sách sự kiện"
            >
              <ArrowLeft size={20} weight="bold" />
              <h2 className={styles.title}>
                {isEditing ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
              </h2>
            </button>
          </div>

          {isEditing && lastUpdated && (
            <div className={styles.right}>
              <Clock size={16} />
              <span>Cập nhật lần cuối: {lastUpdated}</span>
            </div>
          )}
        </div>
      </header>
    </>
  )
}

export default CreateEventStickyHeader
