import { useRef, useLayoutEffect, useEffect, useState, useMemo } from 'react'
import { Check } from '@phosphor-icons/react'
import styles from './RoundTimelineHorizontal.module.css'

function RoundTimelineHorizontal({ rounds = [] }) {
  const outerRef = useRef(null)
  
  const [fadeLeft,  setFadeLeft]  = useState(false)
  const [fadeRight, setFadeRight] = useState(false)

  function updateFade() {
    const el = outerRef.current
    if (!el) return
    
    // Add small tolerance for floating point scroll values
    const canScrollLeft = el.scrollLeft > 1;
    const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
    
    setFadeLeft(canScrollLeft)
    setFadeRight(canScrollRight)
  }

  // Handle Resize and initial fade
  useEffect(() => {
    const handleResize = () => updateFade()
    window.addEventListener('resize', handleResize)
    // Delay initial check to allow DOM to render
    const timer = setTimeout(updateFade, 100)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [rounds])

  useEffect(() => {
    const el = outerRef.current
    if (!el) return

    function onWheel(e) {
      e.preventDefault() // Luôn khoá scroll bên ngoài khi hover
      const canScroll = el.scrollWidth > el.clientWidth
      if (canScroll) {
          el.scrollLeft += e.deltaY || e.deltaX
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className={styles.wrapper}>
      {fadeLeft  && <div className={styles.fadeLeft}  />}
      {fadeRight && <div className={styles.fadeRight} />}
      
      <div 
        className={styles.outer}
        ref={outerRef}
        onScroll={updateFade}
        data-lenis-prevent="true"
      >
        <div className={styles.track}>
        {rounds.map((round, index) => {
          const isLast = index === rounds.length - 1;
          const status = round.status; // 'DONE', 'ACTIVE', 'UPCOMING', 'LATE'
          let derivedStatus = 'upcoming';

          if (status === 'DONE') {
            if (round.message?.type === 'success') derivedStatus = 'doneSuccess';
            else if (round.evaluation) derivedStatus = 'eval';
            else if (round.submissionStatus === 'CLOSED_NO_SUBMISSION') derivedStatus = 'closed';
            else derivedStatus = 'doneFail'; // fallback
          } else if (status === 'ACTIVE') {
            derivedStatus = 'active';
          } else if (status === 'LATE') {
            derivedStatus = 'late';
          }

          return (
            <div key={round.id || index} className={styles.nodeWrapper}>
              <div className={styles.node}>
                <div className={`${styles.iconContainer} ${styles[derivedStatus]}`}>
                  {derivedStatus === 'doneSuccess' && <Check size={28} weight="bold" color="white" />}
                  {derivedStatus !== 'doneSuccess' && <div className={styles[derivedStatus + 'Dot']} />}
                </div>
                <div className={styles.content}>
                  <div className={`${styles.title} ${styles[derivedStatus + 'Title']}`}>
                    {round.name}
                  </div>
                  <div className={`${styles.subtitle} ${styles[derivedStatus + 'Sub']}`}>
                    {round.dateRange}
                  </div>
                </div>
              </div>
              {!isLast && (
                <div className={styles.connector}>
                  <div className={`${styles.line} ${styles['line' + derivedStatus.charAt(0).toUpperCase() + derivedStatus.slice(1)] || ''}`} />
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  )
}

export default RoundTimelineHorizontal;
