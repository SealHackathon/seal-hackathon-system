import { useState, useEffect, useRef, useCallback } from 'react'
import Button from '../../../../components/shared/Button'
import useSticky from '../../../../hooks/useSticky'
import styles from './PublicNav.module.css'

// Đếm ngược tới mốc thời gian
function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  const s = Math.floor(diff / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
  }
}

/**
 * PublicNav — thanh quick-links dính dưới navbar.
 * Có sliding pill indicator di chuyển mượt theo active link.
 */
function PublicNav({ event, sections = [], onRegister, showRegisterBtn = true }) {
  const [active, setActive] = useState(sections[0]?.id)
  const [sentinelRef, isSticky] = useSticky('-1px 0px 0px 0px')
  const cd = useCountdown(event?.registration?.close)
  const pad = (n) => String(n).padStart(2, '0')

  // Ref cho từng link button để tính vị trí pill
  const linkRefs = useRef({})
  const navRef = useRef(null)
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 })

  // Tính toán vị trí pill khi active thay đổi
  const updatePill = useCallback(() => {
    const linkEl = linkRefs.current[active]
    const navEl = navRef.current
    if (!linkEl || !navEl) return

    const navRect = navEl.getBoundingClientRect()
    const linkRect = linkEl.getBoundingClientRect()
    setPillStyle({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      opacity: 1,
    })
  }, [active])

  useEffect(() => {
    updatePill()
  }, [active, updatePill])

  // Cập nhật pill khi resize
  useEffect(() => {
    window.addEventListener('resize', updatePill)
    return () => window.removeEventListener('resize', updatePill)
  }, [updatePill])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [sections])

  const go = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Sentinel để hook phát hiện trạng thái sticky */}
      <div ref={sentinelRef} className={styles.sentinel} />

      <div className={[styles.bar, isSticky ? styles.stuck : ''].join(' ')}>
        <div className={styles.inner}>
          <nav className={styles.links} ref={navRef}>
            {/* Pill indicator di chuyển smooth */}
            <span
              className={styles.pill}
              style={{
                transform: `translateX(${pillStyle.left}px)`,
                width: `${pillStyle.width}px`,
                opacity: pillStyle.opacity,
              }}
            />
            {sections.map((s) => (
              <button
                key={s.id}
                ref={(el) => { linkRefs.current[s.id] = el }}
                type="button"
                className={[styles.link, active === s.id ? styles.linkActive : ''].join(' ')}
                onClick={() => go(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className={styles.right}>
            <div className={styles.countdown}>
              <span className={styles.cdLabel}>Đăng ký đóng sau</span>
              <span className={styles.cdValue}>
                <b>{cd.days}</b> ngày <b>{pad(cd.hours)}</b>:<b>{pad(cd.mins)}</b>:<b>{pad(cd.secs)}</b>
              </span>
            </div>
            {isSticky && showRegisterBtn && (
              <Button label="Đăng ký ngay" color="green" variant="primary" onClick={onRegister} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default PublicNav
