import { useRef, useLayoutEffect, useEffect, useState, useMemo } from 'react'
import { Check } from '@phosphor-icons/react'
import styles from './TimelineHorizontal.module.css'

// ─── Helpers ────────────────────────────────────────

function parseDate(node) {
  if (node.isoDate) {
    const d = new Date(node.isoDate);
    if (!isNaN(d.getTime())) return d;
  }
  const str = node.date;
  if (!str) return null
  if (str.includes('/')) {
    const [d, m, y] = str.split('/')
    return new Date(+y, +m - 1, +d)
  }
  const d = new Date(str)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString()
}

// ────────────────────────────────────────────────────

function TimelineHorizontal({ milestones = [], showToday = true }) {
  const now = useMemo(() => new Date(), [])

  const nodes = useMemo(() => {
    // 1. Parse dates and sort
    const sorted = milestones.map(m => {
      const d = parseDate(m)
      return { ...m, _date: d }
    }).sort((a, b) => {
      if (!a._date && !b._date) return 0
      if (!a._date) return 1
      if (!b._date) return -1
      return a._date - b._date
    })

    // 2. Identify nodes today
    const nodesToday = sorted.filter(n => n._date && isSameDay(n._date, now));
    let todayHasActive = false;

    // 3. Assign states
    return sorted.map(node => {
      if (node.state) return { ...node, _state: node.state };
      if (!node._date) return { ...node, _state: 'upcoming' };

      const pastDayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      // Case 1: Past days
      if (node._date.getTime() < pastDayTime) {
        return { ...node, _state: 'done' };
      }

      // Case 2: Today
      if (isSameDay(node._date, now)) {
        if (nodesToday.length > 1) {
          // Multiple nodes today: exact time logic
          if (node._date <= now) {
            return { ...node, _state: 'done' };
          } else {
            if (!todayHasActive) {
              todayHasActive = true;
              return { ...node, _state: 'active' };
            } else {
              return { ...node, _state: 'upcoming' };
            }
          }
        } else {
          // Only one node today: active all day
          return { ...node, _state: 'active' };
        }
      }

      // Case 3: Future days
      return { ...node, _state: 'upcoming' };
    })
  }, [milestones, now])

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
      e.preventDefault() // Luôn khoá scroll bên ngoài khi hover
      const canScroll = el.scrollWidth > el.clientWidth
      if (canScroll) {
        el.scrollLeft += e.deltaY || e.deltaX
      }
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

    // 1. Is there an active node today?
    const activeTodayIdx = nodes.findIndex(n => n._state === 'active' && n._date && isSameDay(n._date, now));
    if (showToday && activeTodayIdx >= 0) {
      const center = dotCenter(activeTodayIdx);
      if (center !== null) {
        track.style.setProperty('--done-width', `${center}px`);
        track.style.setProperty('--today-left', `${center}px`);
        track.style.setProperty('--today-show', '0');
        updateFade();
        return;
      }
    }

    // 2. Between nodes logic (only when NO nodes today)
    const prevIdx = nodes.reduce((acc, n, i) => (n._date && n._date < now ? i : acc), -1)
    const nextIdx = nodes.findIndex((n, i) => n._date && n._date > now && i > prevIdx)

    const todayBetweenNodes = showToday
      && prevIdx >= 0
      && nextIdx >= 0
      && !nodes.some(n => n._date && isSameDay(n._date, now))

    if (todayBetweenNodes) {
      const prevCenter = dotCenter(prevIdx)
      const nextCenter = dotCenter(nextIdx)
      if (prevCenter !== null && nextCenter !== null) {
        const frac = (now - nodes[prevIdx]._date) / (nodes[nextIdx]._date - nodes[prevIdx]._date)
        const todayLeft = prevCenter + frac * (nextCenter - prevCenter)
        track.style.setProperty('--done-width', `${todayLeft}px`)
        track.style.setProperty('--today-left', `${todayLeft}px`)
        track.style.setProperty('--today-show', '1')
        updateFade()
        return
      }
    }

    // 3. Fallback
    const lastDoneIdx = nodes.reduce(
      (acc, n, i) => (n._state === 'done' || n._state === 'active') ? i : acc, -1
    )
    const center = lastDoneIdx >= 0 ? dotCenter(lastDoneIdx) : null
    track.style.setProperty('--done-width', center ? `${center}px` : '0px')
    
    // Position 'HÔM NAY' on the last done node today, if any
    const lastDoneTodayIdx = nodes.reduce(
      (acc, n, i) => (n._state === 'done' && n._date && isSameDay(n._date, now)) ? i : acc, -1
    )
    if (showToday && lastDoneTodayIdx >= 0) {
      const centerToday = dotCenter(lastDoneTodayIdx);
      if (centerToday !== null) {
        track.style.setProperty('--today-left', `${centerToday}px`);
        track.style.setProperty('--today-show', '1');
      } else {
        track.style.setProperty('--today-show', '0');
      }
    } else {
      track.style.setProperty('--today-show', '0')
    }
    
    updateFade()
  }, [nodes, now, showToday])

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
            <span className={styles.todayIndicatorLabel}>HIỆN TẠI</span>
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