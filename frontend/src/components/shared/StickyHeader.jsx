import { ArrowLeft } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import useSticky from '../../hooks/useSticky'
import styles from './StickyHeader.module.css'

function StickyHeader({ 
  title, 
  backLink, 
  backTooltip = "Quay lại",
  rightContent,
  className = ""
}) {
  const navigate = useNavigate()
  const [sentinelRef, isSticky] = useSticky('-1px 0px 0px 0px')

  return (
    <>
      <div ref={sentinelRef} />
      <header className={`${styles.header} ${isSticky ? styles.isStuck : ''} ${className}`}>
        <div className={styles.container}>
          <div className={styles.left}>
            <button
              className={styles.backLink}
              onClick={() => {
                if (typeof backLink === 'function') {
                  backLink();
                } else if (backLink) {
                  navigate(backLink);
                } else {
                  navigate(-1);
                }
              }}
              title={backTooltip}
            >
              <ArrowLeft size={20} weight="bold" />
              <h2 className={styles.title}>
                {title}
              </h2>
            </button>
          </div>

          {rightContent && (
            <div className={styles.right}>
              {rightContent}
            </div>
          )}
        </div>
      </header>
    </>
  )
}

export default StickyHeader
