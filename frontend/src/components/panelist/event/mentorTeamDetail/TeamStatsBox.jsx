import { ChartBar, Trophy, Star, UploadSimple, ChatsCircle } from '@phosphor-icons/react'
import styles from './TeamStatsBox.module.css'

/**
 * TeamStatsBox — side box thống kê tổng quan về đội.
 * Gồm: chỉ số nổi bật, biểu đồ cột điểm qua từng vòng, tỉ lệ nộp đúng hạn, hỏi đáp.
 *
 * @param {object} stats        — { avgScore, bestRank, totalTeams, onTimeRate, questionsTotal, questionsAnswered }
 * @param {Array}  scoreByRound — [{ label, score, current }]
 */
function TeamStatsBox({ stats = {}, scoreByRound = [] }) {
  const answered = stats.questionsAnswered ?? 0
  const totalQ = stats.questionsTotal ?? 0

  return (
    <section className={styles.card}>
      <span className={styles.title}>
        <ChartBar size={19} weight="fill" className={styles.titleIcon} />
        Thống kê đội
      </span>

      {/* Hai chỉ số nổi bật */}
      <div className={styles.highlightRow}>
        <div className={styles.highlight}>
          <span className={styles.hlIcon}>
            <Star size={32} weight="fill" />
          </span>
          <span className={styles.hlValue}>
            {stats.avgScore != null ? stats.avgScore.toFixed(2) : '—'}
            <span className={styles.hlUnit}>/10</span>
          </span>
          <span className={styles.hlLabel}>Điểm trung bình</span>
        </div>
        <div className={styles.highlight}>
          <span className={styles.hlIconOrange}>
            <Trophy size={32} weight="fill" />
          </span>
          <span className={styles.hlValueOrange}>
            #{stats.bestRank ?? '—'}
            <span className={styles.hlUnit}>/{stats.totalTeams ?? '—'}</span>
          </span>
          <span className={styles.hlLabel}>Thứ hạng tốt nhất</span>
        </div>
      </div>

      {/* Biểu đồ cột: điểm qua từng vòng */}
      {scoreByRound.length > 0 && (
        <div className={styles.chartBlock}>
          <span className={styles.blockLabel}>Điểm qua từng vòng</span>
          <div className={styles.chart}>
            {scoreByRound.map((r) => (
              <div key={r.label} className={styles.barCol}>
                <span className={styles.barValue}>{r.score != null ? r.score.toFixed(1) : '—'}</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${r.current ? styles.barFillCurrent : ''}`}
                    style={{ height: `${r.score != null ? (r.score / 10) * 100 : 0}%` }}
                  />
                </div>
                <span className={styles.barLabel}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Hỏi đáp */}
      <div className={styles.statBlock}>
        <div className={styles.statHead}>
          <span className={styles.statLabel}>
            <ChatsCircle size={16} weight="fill" className={styles.statIcon} />
            Hỏi đáp với mentor
          </span>
          <span className={styles.statValue}>
            {answered}/{totalQ}
          </span>
        </div>
        <span className={styles.statHint}>Đã trả lời {answered} trên tổng {totalQ} câu hỏi</span>
      </div>
    </section>
  )
}

export default TeamStatsBox
