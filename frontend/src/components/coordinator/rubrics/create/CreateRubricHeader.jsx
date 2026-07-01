import { ArrowLeft, Clock } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import useSticky from '../../../../hooks/useSticky'
import styles from './CreateRubricHeader.module.css'

function CreateRubricHeader({ isEditing, lastUpdated }) {
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
            onClick={() => navigate('/admin/coordinator/rubrics')}
            title="Quay lại Thư viện Rubric"
          >
            <ArrowLeft size={20} weight="bold" />
            <h1 className={styles.title}>
              {isEditing ? 'Chỉnh sửa Rubric' : 'Tạo Rubric Mới'}
            </h1>
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

export default CreateRubricHeader
