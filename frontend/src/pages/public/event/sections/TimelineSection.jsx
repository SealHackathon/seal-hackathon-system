import { useRef, useState, useEffect } from 'react'
import { CalendarBlank, DoorOpen, Door, Flag, Path, ArrowUpRight } from '@phosphor-icons/react'
import useScrollReveal from '../../../../hooks/useScrollReveal'
import styles from './TimelineSection.module.css'

// Gom các mốc từ đăng ký + vòng thi (auto) và mốc thủ công (manual)
function buildTimeline(event, rounds, milestones) {
  const items = []
  if (event?.registration?.open)
    items.push({ date: event.registration.open, title: 'Mở đăng ký', kind: 'auto', icon: 'open' })
  if (event?.registration?.close)
    items.push({ date: event.registration.close, title: 'Đóng đăng ký', kind: 'auto', icon: 'close' })
  ;(rounds || []).forEach((r) =>
    items.push({ date: r.start, title: r.name, kind: 'auto', icon: 'round' }),
  )
  ;(milestones || []).forEach((m) =>
    items.push({ date: m.start, title: m.name, desc: m.desc, link: m.link, kind: 'manual', icon: 'flag' }),
  )
  const sorted = items
    .filter((i) => i.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  
  // Tìm mốc thời gian sắp/đang diễn ra (mốc đầu tiên >= hiện tại)
  const now = new Date()
  const currentIndex = sorted.findIndex(i => new Date(i.date) >= now)
  if (currentIndex !== -1) {
    sorted[currentIndex].isCurrent = true
  }
  
  return sorted
}

const ICONS = { open: DoorOpen, close: Door, round: Path, flag: Flag }

function formatDay(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.getDate().toString().padStart(2, '0')
}
function formatMonth(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return 'Tháng ' + (d.getMonth() + 1)
}
function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

function TimelineSection({ id, event, rounds, milestones }) {
  const items = buildTimeline(event, rounds, milestones)
  const scrollRef = useRef(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.15 })

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeft(scrollLeft > 0)
    setShowRight(scrollLeft + clientWidth < scrollWidth - 1)
  }

  useEffect(() => {
    handleScroll()
    window.addEventListener('resize', handleScroll)
    return () => window.removeEventListener('resize', handleScroll)
  }, [items.length])

  return (
    <section id={id} ref={sectionRef} className={`${styles.section} ${isVisible ? styles.revealed : ''}`}>
      <div className={styles.headCol}>
        <span className={styles.eyebrow}>Lịch trình</span>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.ac}>Về</span> Lịch trình sự kiện
          </h2>
          <span className={styles.hicon}>
            <CalendarBlank weight="fill" />
          </span>
        </div>
        <div className={styles.uline}>
          <span />
          <span />
        </div>
      </div>

      <div className={styles.scrollWrapper}>
        {showLeft && <div className={`${styles.overlay} ${styles.overlayLeft}`} />}
        <div className={styles.scroller} ref={scrollRef} onScroll={handleScroll}>
          <div className={styles.track}>
            {items.map((it, i) => {
              const Icon = ICONS[it.icon] || CalendarBlank
              
              return (
                <div key={i} className={`${styles.item} ${it.isCurrent ? styles.currentTimeline : ''}`}>
                  <div className={styles.itemTop}>
                    <div className={styles.dateBlock}>
                      <span className={styles.dateMonth}>{formatMonth(it.date)}</span>
                      <span className={styles.dateDay}>{formatDay(it.date)}</span>
                      <span className={styles.time}>{formatTime(it.date)}</span>
                    </div>
                    <span className={`${styles.iconWrap} ${it.isCurrent ? styles.pulseActive : ''}`}>
                      <Icon size={24} weight="fill" />
                    </span>
                  </div>
                  
                  <h3 className={styles.itemTitle}>{it.title}</h3>
                  {it.desc && <p className={styles.desc}>{it.desc}</p>}
                  
                  {it.link && (
                    <div className={styles.tags}>
                      <a className={styles.link} href={it.link} target="_blank" rel="noreferrer">
                        Tham gia <ArrowUpRight size={18} weight="bold" />
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        {showRight && <div className={`${styles.overlay} ${styles.overlayRight}`} />}
      </div>
    </section>
  )
}

export default TimelineSection
