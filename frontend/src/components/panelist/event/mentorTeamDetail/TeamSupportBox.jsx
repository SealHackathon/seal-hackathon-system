import { useState, useMemo, useRef, useEffect } from 'react'
import { ChatCircleDots, CheckCircle } from '@phosphor-icons/react'
import Badge from '../../../shared/Badge'
import Button from '../../../shared/Button'
import MentorRequestModal from '../MentorRequestModal'
import styles from './TeamSupportBox.module.css'

// "Vừa xong" / "x phút trước" / "x giờ trước" / "x ngày trước"
function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Vừa xong'
  if (min < 60) return `${min} phút trước`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} giờ trước`
  return `${Math.floor(hour / 24)} ngày trước`
}

/**
 * TeamSupportBox — box yêu cầu hỗ trợ của riêng đội này.
 * Giống box "Câu hỏi chờ xử lí" bên tab mentor: cuộn ngang + popup trả lời.
 *
 * @param {object}   team          — { id, name }
 * @param {Array}    requests      — [{ id, question, createdAt, answer?, answeredAt? }]
 * @param {function} [onSubmitReply]
 */
function TeamSupportBox({ team, requests = [], onSubmitReply }) {
  const [open, setOpen] = useState(false)

  const pendingRequests = useMemo(() => requests.filter((r) => !r.answer), [requests])

  // ── Overlay fade khi còn cuộn được sang trái/phải ──
  const scrollRef = useRef(null)
  const [fade, setFade] = useState({ left: false, right: false })

  function updateFade() {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setFade({ left: scrollLeft > 4, right: scrollLeft + clientWidth < scrollWidth - 4 })
  }

  useEffect(() => {
    updateFade()
    window.addEventListener('resize', updateFade)
    return () => window.removeEventListener('resize', updateFade)
  }, [pendingRequests.length])

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>
          <ChatCircleDots size={19} weight="fill" className={styles.titleIcon} />
          Yêu cầu hỗ trợ từ đội
        </span>
        <div className={styles.headRight}>
          {pendingRequests.length > 0 && (
            <Badge variant="orangeSolid" size="lg" dot={false} label={`${pendingRequests.length} chờ`} />
          )}
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.empty}>
            <CheckCircle size={24} weight="fill" color='var(--color-border-blue)'/>
            Không có câu hỏi nào đang chờ
          </div>
          <Button
            label="Xem tất cả"
            variant="outline"
            color="blue"
            labelSize={13}
            onClick={() => setOpen(true)}
          />
        </div>
      ) : (
        <div className={styles.scrollShell}>
          {fade.left && <div className={`${styles.fade} ${styles.fadeLeft}`} />}
          {fade.right && <div className={`${styles.fade} ${styles.fadeRight}`} />}

          <div className={`${styles.hscroll} scrollbar`} ref={scrollRef} onScroll={updateFade}>
            {pendingRequests.map((r) => (
              <article key={r.id} className={styles.qCard}>
                <div className={styles.qCardMain}>
                  <div className={styles.qCardHead}>
                    <span className={styles.qTeam}>{team?.name}</span>
                    <span className={styles.qTime}>{timeAgo(r.createdAt)}</span>
                  </div>
                  <p className={styles.qText}>{r.question}</p>
                </div>
                <Button
                  className={styles.replyBtn}
                  label="Trả lời"
                  variant="outline"
                  color="blue"
                  labelSize={13}
                  onClick={() => setOpen(true)}
                />
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Popup xem & trả lời toàn bộ câu hỏi của đội */}
      <MentorRequestModal
        open={open}
        team={team}
        requests={requests}
        onClose={() => setOpen(false)}
        onSubmitReply={onSubmitReply}
      />
    </section>
  )
}

export default TeamSupportBox
