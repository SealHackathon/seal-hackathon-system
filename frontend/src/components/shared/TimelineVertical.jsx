import { useRef, useLayoutEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowSquareOut } from '@phosphor-icons/react'
import styles from './TimelineVertical.module.css'

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

function fmtDate(d) {
    if (!d) return ''
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtTime(d) {
    if (!d) return ''
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/**
 * TimelineVertical
 *
 * Props:
 *   milestones : Array<{
 *       id, title,
 *       date     : Date | null,
 *       endDate  : Date | null,
 *       description?,
 *       link?,
 *       location?,
 *       submissionDeadline?: Date,
 *   }>
 *   showToday  : boolean
 */
function TimelineVertical({ milestones = [], showToday = true }) {
    const today  = useMemo(() => todayStart(), [])
    const trackRef = useRef(null)
    const dotRefs  = useRef([])

    const nodes = useMemo(() =>
        milestones.map(m => ({
            ...m,
            _date  : m.date  instanceof Date ? m.date  : null,
            _state : autoState(m.date instanceof Date ? m.date : null, today),
        })),
    [milestones, today])

    // ── Green line + HÔM NAY position
    useLayoutEffect(() => {
        const track = trackRef.current
        if (!track) return
        const tr = track.getBoundingClientRect()

        function dotMid(i) {
            const el = dotRefs.current[i]
            if (!el) return null
            const r = el.getBoundingClientRect()
            return r.top + r.height / 2 - tr.top
        }

        const prevIdx = nodes.reduce((acc, n, i) => n._date && n._date < today ? i : acc, -1)
        const nextIdx = nodes.findIndex((n, i) => n._date && n._date > today && i > prevIdx)

        const todayBetween = showToday
            && prevIdx >= 0 && nextIdx >= 0
            && !nodes.some(n => n._date && isSameDay(n._date, today))

        if (todayBetween) {
            const p = dotMid(prevIdx), q = dotMid(nextIdx)
            if (p !== null && q !== null) {
                const frac = (today - nodes[prevIdx]._date) / (nodes[nextIdx]._date - nodes[prevIdx]._date)
                const ty = p + frac * (q - p)
                track.style.setProperty('--done-h', `${ty}px`)
                track.style.setProperty('--today-top', `${ty}px`)
                track.style.setProperty('--today-show', '1')
                return
            }
        }

        const lastDone = nodes.reduce((acc, n, i) =>
            (n._state === 'done' || n._state === 'active') ? i : acc, -1)
        const cy = lastDone >= 0 ? dotMid(lastDone) : null
        track.style.setProperty('--done-h', cy ? `${cy}px` : '0px')
        track.style.setProperty('--today-show', '0')
    }, [nodes, today, showToday])

    return (
        <div className={styles.track} ref={trackRef}>

            {/* Dường thẳng dọc */}
            <div className={styles.line} />
            <div className={styles.lineDone} />

            {/* HÔM NAY */}
            {showToday && (
                <div className={styles.todayIndicator}>
                    <span className={styles.todayLine} />
                    <span className={styles.todayLabel}>HÔM NAY</span>
                </div>
            )}

            {/* Nodes */}
            {nodes.map((node, i) => {
                const s = node._state
                const dateStr = node._date ? fmtDate(node._date) : ''
                const timeStr = node._date
                    ? (node.endDate
                        ? `${fmtTime(node._date)} – ${fmtTime(node.endDate)}`
                        : fmtTime(node._date))
                    : ''

                return (
                    <motion.div
                        layout
                        transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
                        key={node.id ?? i}
                        className={styles.node}
                    >
                        <div
                            className={`${styles.dot} ${
                                s === 'done'   ? styles.dotDone   :
                                s === 'active' ? styles.dotActive :
                                                 styles.dotUpcoming}`}
                            ref={el => dotRefs.current[i] = el}
                        >
                            {s === 'done' && <Check size={13} weight="bold" />}
                        </div>

                        <div className={styles.content}>
                            <p className={`${styles.dateTime} ${
                                s === 'upcoming' ? styles.textMuted : ''}`}>
                                {dateStr}{timeStr ? ` - ${timeStr}` : ''}
                            </p>

                            <p className={`${styles.title} ${
                                s === 'done'   ? styles.titleDone   :
                                s === 'active' ? styles.titleActive :
                                                 styles.titleUpcoming}`}>
                                {node.title}
                            </p>

                            {node.description && (
                                <p className={`${styles.meta} ${s === 'upcoming' ? styles.textMuted : ''}`}>
                                    {node.description}
                                </p>
                            )}
                            {node.submissionDeadline && (
                                <p className={`${styles.meta} ${s === 'upcoming' ? styles.textMuted : ''}`}>
                                    Hạn nộp bài: {fmtTime(node.submissionDeadline)} cùng ngày
                                </p>
                            )}
                            {node.location && (
                                <p className={`${styles.meta} ${s === 'upcoming' ? styles.textMuted : ''}`}>
                                    Địa điểm: {node.location}
                                </p>
                            )}
                            {node.link && (
                                <p className={`${styles.meta} ${s === 'upcoming' ? styles.textMuted : ''}`}>
                                    Link tham gia:{' '}
                                    <a href={node.link} target="_blank" rel="noopener noreferrer"
                                        className={styles.link}>
                                        Xem tại đây <ArrowSquareOut size={12} weight="bold" />
                                    </a>
                                </p>
                            )}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

export default TimelineVertical
