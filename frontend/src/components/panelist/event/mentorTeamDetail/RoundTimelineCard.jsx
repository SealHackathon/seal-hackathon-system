import { CheckFat, Lightning, Lock, CalendarBlank, Trophy, Eye, Minus } from '@phosphor-icons/react'
import Badge from '../../../shared/Badge'
import Button from '../../../shared/Button'
import SubmissionRing from '../../../shared/SubmissionRing'
import styles from './RoundTimeline.module.css'

function fmtDate(d) {
  if (!d) return '—'
  const x = new Date(d)
  const dd = String(x.getDate()).padStart(2, '0')
  const mo = String(x.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mo}/${x.getFullYear()}`
}

// Cấu hình node theo vòng đời và trạng thái của team
function nodeInfo(round) {
  if (round.result) {
    if (round.result.status === 'failed') return { cls: 'nodeFailed', icon: Minus, weight: 'bold' }
    if (round.result.status === 'passed') return { cls: 'nodeDone', icon: CheckFat }
  }

  if (round.lifecycle === 'ended') return { cls: 'nodeDone', icon: CheckFat }
  if (round.lifecycle === 'active') return { cls: 'nodeActive', icon: Lightning }
  return { cls: 'nodeUpcoming', icon: Lock }
}

// Suy ra trạng thái nộp của từng hạng mục cho submission ring.
function ringItems(sub = {}) {
  const has = (x) => !!(x && (x.url || x.fileUrl))
  return [
    { key: 'github', label: 'Source code', done: has(sub.github) },
    { key: 'slide', label: 'Slide thuyết trình', done: has(sub.slide) },
    { key: 'video', label: 'Video demo', done: has(sub.video) },
  ]
}

/**
 * RoundTimelineCard — một card vòng thi trên timeline dọc.
 * Nổi bật thứ hạng + kết quả (box bên trái bảng xếp hạng lân cận).
 *
 * @param {object}   round
 * @param {boolean}  last              — có phải node cuối (ẩn đường nối)
 * @param {function} onViewSubmission  — (round) => void
 */
function RoundTimelineCard({ round, last, onViewSubmission }) {
  const node = nodeInfo(round)
  const NodeIcon = node.icon
  const result = round.result
  const neighbors = round.neighbors ?? []

  return (
    <div className={styles.item}>
      {/* Rail: node + đường nối */}
      <div className={styles.rail}>
        <span className={`${styles.node} ${styles[node.cls]}`}>
          <NodeIcon size={20} weight={node.weight || "fill"} />
        </span>
        {!last && <span className={styles.line} />}
      </div>

      {/* Card nội dung */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.headLeft}>
            <div className={styles.nameRow}>
              <span className={styles.roundName}>{round.name}</span>
              {result?.label && (
                <Badge
                  variant={result.status === 'passed' ? 'green' : result.status === 'failed' ? 'gray' : 'orange'}
                  size="sm"
                  dot={false}
                  label={result.label}
                />
              )}
            </div>
            <span className={styles.roundDate}>
              <CalendarBlank size={14} weight="fill" className={styles.dateIcon} />
              {fmtDate(round.timeStart)} – {fmtDate(round.timeEnd)}
            </span>
          </div>

          {/* Góc trên phải: submission ring + nút xem bài nộp */}
          {(round.hasSubmission || round.lifecycle === 'active') && (
            <div className={styles.headRight}>
              <SubmissionRing items={ringItems(round.submission)} size={44} thickness={6} />
              <Button
                label="Xem bài nộp"
                icon={Eye}
                iconWeight="fill"
                variant="outline"
                color="blue"
                labelSize={13}
                onClick={() => onViewSubmission?.(round)}
              />
            </div>
          )}
        </div>

        {/* Kết quả: box xếp hạng/điểm bên trái | bảng xếp hạng lân cận bên phải */}
        {result ? (
          <div className={styles.resultGrid}>
            <div className={styles.resultBox}>
              <div className={styles.stat}>
                <span className={styles.statTitle}>Xếp hạng</span>
                <span className={styles.rankValue}>
                  #{result.rank}<span className={styles.rankUnit}>/{result.totalTeams} đội</span>
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statTitle}>
                  <Trophy size={14} weight="fill" className={styles.statIcon} />
                  Tổng điểm
                </span>
                <span className={styles.scoreValue}>
                  {result.score.toFixed(2)}<span className={styles.scoreMax}>/10</span>
                </span>
              </div>
            </div>

            {neighbors.length > 0 && (
              <div className={styles.neighbors}>
                {neighbors.map((n) => (
                  <div
                    key={n.rank}
                    className={`${styles.nbRow} ${n.isSelf ? styles.nbSelf : ''}`}
                  >
                    <span className={styles.nbRank}>#{n.rank}</span>
                    <span className={styles.nbName}>{n.name}</span>
                    <span className={styles.nbTrack}>
                      <span className={styles.nbFill} style={{ width: `${(n.score / 10) * 100}%` }} />
                    </span>
                    <span className={styles.nbScore}>{n.score.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : round.lifecycle === 'upcoming' ? (
          <p className={styles.pending}>Vòng thi chưa diễn ra.</p>
        ) : round.lifecycle === 'active' ? (
          <p className={styles.pending}>Đang trong thời gian thi đấu.</p>
        ) : (
          <p className={styles.pending}>Đang chờ công bố kết quả.</p>
        )}
      </div>
    </div>
  )
}

export default RoundTimelineCard