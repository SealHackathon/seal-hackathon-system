import { useState } from 'react'
import { Path } from '@phosphor-icons/react'
import RoundTimelineCard from './RoundTimelineCard'
import SubmissionModal from './SubmissionModal'
import styles from './RoundTimeline.module.css'

/**
 * RoundTimeline — timeline dọc các vòng thi của đội.
 * Một vòng = một card; bấm "Xem bài nộp" mở popup SubmissionModal.
 *
 * @param {Array} rounds
 */
function RoundTimeline({ rounds = [] }) {
  const [activeRound, setActiveRound] = useState(null)

  return (
    <section className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.title}>
          <Path size={19} weight="fill" className={styles.titleIcon} />
          Hành trình vòng thi
        </span>
      </div>

      <div className={styles.timeline}>
        {rounds.map((round, i) => (
          <RoundTimelineCard
            key={round.id}
            round={round}
            last={i === rounds.length - 1}
            onViewSubmission={setActiveRound}
          />
        ))}
      </div>

      <SubmissionModal
        open={!!activeRound}
        round={activeRound}
        onClose={() => setActiveRound(null)}
      />
    </section>
  )
}

export default RoundTimeline
