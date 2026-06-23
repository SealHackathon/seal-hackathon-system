import { useRef, useLayoutEffect, useEffect, useState, useMemo } from 'react'
import { Check } from '@phosphor-icons/react'
import styles from './TimelineHorizontal.module.css'

// ─── Helpers ────────────────────────────────────────

function parseDate(str) {
  if (!str) return null
  if (str.includes('/')) {
    const [d, m, y] = str.split('/')
    return new Date(+y, +m - 1, +d)
  }
  const d = new Date(str)
  d.setHours(0, 0, 0, 0)
  return d
}

function todayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString()
}

function autoState(date, today) {
  if (!date) return 'upcoming'
  if (isSameDay(date, today)) return 'active'
  return date < today ? 'done' : 'upcoming'
}

// ────────────────────────────────────────────────────

function TimelineHorizontal({ milestones = [], showToday = true }) {
  const today = useMemo(() => todayStart(), [new Date().toDateString()])

  const nodes = useMemo(() => milestones.map(m => {
    const d = parseDate(m.date)
    return { ...m, _date: d, _state: m.state ?? autoState(d, today) }
  }), [milestones, today])

  const outerRef = useRef(null)
  const trackRef = useRef(null)
  const dotRefs  = useRef([])

  // ── Fade state ──────────────────────────────────────
  const [fadeLeft,  setFadeLeft]  = useState(false)
  const [fadeRight, setFadeRight] = useState(false)

  function updateFade() {
    const el = outerRef.current
    if (!el) return
    setFadeLeft(el.scrollLeft > 0)
    setFadeRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }

  // ── Wheel → scroll ngang ──
  useEffect(() => {
    const el = outerRef.current
    if (!el) return

    function onWheel(e) {
      const canScroll = el.scrollWidth > el.clientWidth
      if (!canScroll) return
      e.preventDefault()
      el.scrollLeft += e.deltaY || e.deltaX
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // ── Green line + HÔM NAY ──
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const trackRect = track.getBoundingClientRect()

    function dotCenter(idx) {
      const el = dotRefs.current[idx]
      if (!el) return null
      const r = el.getBoundingClientRect()
      return r.left + r.width / 2 - trackRect.left
    }

    const prevIdx = nodes.reduce((acc, n, i) => (n._date && n._date < today ? i : acc), -1)
    const nextIdx = nodes.findIndex((n, i) => n._date && n._date > today && i > prevIdx)

    const todayBetweenNodes = showToday
      && prevIdx >= 0
      && nextIdx >= 0
      && !nodes.some(n => n._date && isSameDay(n._date, today))

    if (todayBetweenNodes) {
      const prevCenter = dotCenter(prevIdx)
      const nextCenter = dotCenter(nextIdx)
      if (prevCenter !== null && nextCenter !== null) {
        const frac = (today - nodes[prevIdx]._date) / (nodes[nextIdx]._date - nodes[prevIdx]._date)
        const todayLeft = prevCenter + frac * (nextCenter - prevCenter)
        track.style.setProperty('--done-width', `${todayLeft}px`)
        track.style.setProperty('--today-left', `${todayLeft}px`)
        track.style.setProperty('--today-show', '1')
        updateFade()
        return
      }
    }

    const lastDoneIdx = nodes.reduce(
      (acc, n, i) => (n._state === 'done' || n._state === 'active') ? i : acc, -1
    )
    const center = lastDoneIdx >= 0 ? dotCenter(lastDoneIdx) : null
    track.style.setProperty('--done-width', center ? `${center}px` : '0px')
    track.style.setProperty('--today-show', '0')
    updateFade()
  }, [nodes, today, showToday])

  return (
    // ── wrapper bọc ngoài để đặt fade overlay ──
    <div className={styles.wrapper}>

      {fadeLeft  && <div className={styles.fadeLeft}  />}
      {fadeRight && <div className={styles.fadeRight} />}

      <div
        className={styles.outer}
        ref={outerRef}
        onScroll={updateFade}
      >
        <div className={styles.track} ref={trackRef}>

          <div className={styles.line} />
          <div className={styles.lineDone} />
          <div className={styles.arrow} />

          <div className={styles.todayIndicator}>
            <span className={styles.todayIndicatorLabel}>HÔM NAY</span>
            <span className={styles.todayIndicatorLine} />
          </div>

          {nodes.map((node, i) => {
            const s = node._state
            return (
              <div
                key={i}
                className={styles.node}
                ref={el => dotRefs.current[i] = el}
              >
                <span className={styles.nodeDate}>{node.date}</span>
                <div className={`${styles.dot} ${
                  s === 'done'   ? styles.dotDone   :
                  s === 'active' ? styles.dotActive :
                                   styles.dotUpcoming
                }`}>
                  {s === 'done' && <Check size={13} weight="bold" />}
                </div>
                <span className={`${styles.nodeLabel} ${
                  s === 'done'   ? styles.labelDone   :
                  s === 'active' ? styles.labelActive :
                                   styles.labelUpcoming
                }`}>
                  {node.label}
                </span>
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}

export default TimelineHorizontal