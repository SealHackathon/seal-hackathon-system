import { useState, useMemo, useRef, useEffect } from 'react'
import { ChatCircleDots, CheckCircle } from '@phosphor-icons/react'
import Badge from '../../shared/Badge'
import Button from '../../shared/Button'
import MentorTeamTable from './MentorTeamTable'
import MentorRequestModal from './MentorRequestModal'
import styles from './MentorTab.module.css'

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
 * MentorTab — nội dung chính tab Mentor.
 * Gồm: box câu hỏi chờ xử lí (cuộn ngang) ở trên cùng + bảng đội phụ trách.
 * Popup câu hỏi theo từng đội được quản lý tại đây.
 *
 * @param {object} event
 */
function MentorTab({ event }) {
  const mentor = event.assignment?.mentor ?? {}
  const teams = mentor.teams ?? []
  const requests = mentor.requests ?? []

  const [activeTeam, setActiveTeam] = useState(null)

  // Câu hỏi đang chờ trả lời (cho box cuộn ngang trên cùng).
  const pendingRequests = useMemo(
    () => requests.filter((r) => !r.answer),
    [requests],
  )

  // Câu hỏi của đội đang mở popup.
  const activeRequests = useMemo(
    () => (activeTeam ? requests.filter((r) => r.teamId === activeTeam.id) : []),
    [activeTeam, requests],
  )

  // ── Overlay fade khi còn cuộn được sang trái/phải ──
  const scrollRef = useRef(null)
  const [fade, setFade] = useState({ left: false, right: false })

  function updateFade() {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setFade({
      left: scrollLeft > 4,
      right: scrollLeft + clientWidth < scrollWidth - 4,
    })
  }

  useEffect(() => {
    updateFade()
    window.addEventListener('resize', updateFade)
    return () => window.removeEventListener('resize', updateFade)
  }, [pendingRequests.length])

  function handleReply(requestId, text) {
    // TODO: gọi API gửi phản hồi. Hiện mock chỉ log.
    console.log('reply', requestId, text)
  }

  return (
    <div className={styles.stack}>
      {/* Box câu hỏi chờ xử lí — cuộn ngang */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}>
            <ChatCircleDots size={19} weight="fill" className={styles.titleIcon} />
            Câu hỏi chờ xử lí
          </span>
          <Badge variant="blueSolid" size="sm" dot={false} label={`${pendingRequests.length} câu hỏi`} />
        </div>

        {pendingRequests.length === 0 ? (
          <div className={styles.empty}>
            <CheckCircle size={18} weight="fill" />
            Không có câu hỏi nào đang chờ
          </div>
        ) : (
          <div className={styles.scrollShell}>
            {fade.left && <div className={`${styles.fade} ${styles.fadeLeft}`} />}
            {fade.right && <div className={`${styles.fade} ${styles.fadeRight}`} />}

            <div className={`${styles.hscroll} scrollbar`} ref={scrollRef} onScroll={updateFade}>
              {pendingRequests.map((r) => {
                const team = teams.find((t) => t.id === r.teamId)
                return (
                  <article key={r.id} className={styles.qCard}>
                    <div className={styles.qCardMain}>
                      <div className={styles.qCardHead}>
                        <span className={styles.qTeam}>{r.teamName}</span>
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
                      onClick={() => setActiveTeam(team ?? { id: r.teamId, name: r.teamName })}
                    />
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Bảng đội phụ trách */}
      <MentorTeamTable teams={teams} onOpenRequests={setActiveTeam} />

      {/* Popup câu hỏi của đội */}
      <MentorRequestModal
        open={!!activeTeam}
        team={activeTeam}
        requests={activeRequests}
        onClose={() => setActiveTeam(null)}
        onSubmitReply={handleReply}
      />
    </div>
  )
}

export default MentorTab
