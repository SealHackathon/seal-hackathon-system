import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, ChatCircleDots } from '@phosphor-icons/react'
import Button from '../../shared/Button'
import FormTextarea from '../../shared/FormTextarea'
import styles from './MentorRequestModal.module.css'

function fmtDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * MentorRequestModal — popup xem & trả lời câu hỏi của một đội.
 * Layout mỗi câu: câu hỏi 40% | phần trả lời 60%.
 * Câu chưa trả lời: ô nhập phản hồi hiện sẵn (không cần bấm mở).
 *
 * @param {boolean}  open
 * @param {function} onClose
 * @param {object}   team           — { id, name }
 * @param {Array}    requests       — [{ id, question, createdAt, answer?, answeredAt? }]
 * @param {function} onSubmitReply  — (requestId, text) => void
 */
function MentorRequestModal({ open, onClose, team, requests = [], onSubmitReply }) {
  const [replyTexts, setReplyTexts] = useState({})
  const [localAnswers, setLocalAnswers] = useState({})
  const [showFade, setShowFade] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = originalOverflow }
    }
  }, [open])

  function updateFade() {
    const el = bodyRef.current
    if (!el) return
    // Allow a small threshold (e.g. 2px) for sub-pixel rounding
    setShowFade(el.scrollHeight > el.clientHeight && el.scrollTop + el.clientHeight < el.scrollHeight - 2)
  }

  useEffect(() => {
    if (open) {
      setTimeout(updateFade, 0)
      window.addEventListener('resize', updateFade)
      return () => window.removeEventListener('resize', updateFade)
    }
  }, [open, requests])

  if (!open) return null

  function setReplyText(id, value) {
    setReplyTexts((prev) => ({ ...prev, [id]: value }))
  }
  function submitReply(id) {
    const text = (replyTexts[id] ?? '').trim()
    if (!text) return
    const entry = { answer: text, answeredAt: new Date().toISOString() }
    setLocalAnswers((prev) => ({ ...prev, [id]: entry }))
    onSubmitReply?.(id, text)
    setReplyTexts((prev) => ({ ...prev, [id]: '' }))
  }

  const getAnswer = (r) => localAnswers[r.id]?.answer ?? r.answer
  const getAnsweredAt = (r) => localAnswers[r.id]?.answeredAt ?? r.answeredAt
  const isAnswered = (r) => Boolean(getAnswer(r))

  const pendingCount = requests.filter((r) => !isAnswered(r)).length

  return createPortal(
    <div className={styles.overlay} onClick={onClose} data-lenis-prevent="true">
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} data-lenis-prevent="true">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headTitle}>
            <ChatCircleDots size={22} weight="fill" className={styles.headIcon} />
            <div>
              <p className={styles.teamName}>{team?.name}</p>
              <p className={styles.headSub}>
                {requests.length} câu hỏi · {pendingCount} chờ trả lời
              </p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className={`${styles.body} scrollbar`} ref={bodyRef} onScroll={updateFade}>
          {requests.length === 0 && (
            <p className={styles.empty}>Đội này chưa gửi câu hỏi nào.</p>
          )}

          {requests.map((r) => {
            const answered = isAnswered(r)
            return (
              <div key={r.id} className={styles.qaCard}>
                {/* Câu hỏi (40%) */}
                <div className={`${styles.qaCol} ${styles.questionCol}`}>
                  <span className={styles.qaLabel}>Câu hỏi</span>
                  <p className={styles.qaQuestion}>{r.question}</p>
                  <span className={styles.qaTime}>{fmtDateTime(r.createdAt)}</span>
                </div>

                {/* Phản hồi (60%) */}
                <div className={`${styles.qaCol} ${styles.answerCol}`}>
                  {answered ? (
                    <>
                      <span className={styles.qaLabel}>Phản hồi của mentor</span>
                      <p className={styles.qaAnswer}>{getAnswer(r)}</p>
                      <span className={styles.qaTime}>{fmtDateTime(getAnsweredAt(r))}</span>
                    </>
                  ) : (
                    <div className={styles.replyForm}>
                      <span className={styles.qaLabel}>Trả lời</span>
                      <div className={styles.replyInputRow}>
                        <FormTextarea
                          className={styles.replyTextarea}
                          value={replyTexts[r.id] ?? ''}
                          onChange={(e) => setReplyText(r.id, e.target.value)}
                          placeholder="Nhập phản hồi cho đội..."
                          rows={2}
                          maxLength={500}
                        />
                        <div className={styles.replyActions}>
                          <Button label="Gửi" variant="primary" color="blue" labelSize={13} onClick={() => submitReply(r.id)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className={`${styles.fadeBottom} ${showFade ? styles.fadeBottomShow : ''}`} />
      </div>
    </div>,
    document.body,
  )
}

export default MentorRequestModal