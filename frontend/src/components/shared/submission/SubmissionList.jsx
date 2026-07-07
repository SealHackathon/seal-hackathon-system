import { CheckCircle, LockKey, CloudArrowUp, WarningCircle, MinusCircle, Repeat } from '@phosphor-icons/react'
import SubmissionRoundCard from './SubmissionRoundCard'
import styles from './SubmissionList.module.css'

function SubmissionList({ rounds = [], role }) {
  return (
    <div className={styles.container}>
      {rounds.map((round, index) => {
        let iconBgClass = styles.iconUpcoming;
        let IconComponent = LockKey;
        let iconColor = 'var(--color-text-muted)';
        let lineClass = styles.lineUpcoming;

        let derivedStatus = 'upcoming';

        if (round.status === 'DONE') {
          if (round.message && round.message.type === 'success') {
            derivedStatus = 'doneSuccess';
          } else if (round.evaluation) {
            derivedStatus = 'eval';
          } else if (round.submissionStatus === 'CLOSED_NO_SUBMISSION') {
            derivedStatus = 'closed';
          } else {
            derivedStatus = 'doneSuccess';
          }
        } else if (round.status === 'ACTIVE') {
          derivedStatus = 'active';
        } else if (round.status === 'LATE') {
          derivedStatus = 'late';
        }

        switch (derivedStatus) {
          case 'doneSuccess':
            iconBgClass = styles.iconDoneSuccess;
            IconComponent = CheckCircle;
            iconColor = 'white';
            break;
          case 'eval':
            iconBgClass = styles.iconDoneEval;
            IconComponent = MinusCircle;
            iconColor = 'var(--color-primary-blue)';
            break;
          case 'closed':
            iconBgClass = styles.iconDoneClosed;
            IconComponent = MinusCircle;
            iconColor = 'var(--color-primary-orange)';
            break;
          case 'active':
            iconBgClass = styles.iconActive;
            IconComponent = round.submissionStatus === 'READY' ? Repeat : CloudArrowUp;
            iconColor = 'white';
            break;
          case 'late':
            iconBgClass = styles.iconLate;
            IconComponent = WarningCircle;
            iconColor = 'white';
            break;
          default:
            iconBgClass = styles.iconUpcoming;
            IconComponent = LockKey;
            iconColor = 'var(--color-text-muted)';
        }

        const isDone = round.status === 'DONE';
        lineClass = isDone ? styles.lineDoneSuccess : styles.lineUpcoming;

        return (
          <div key={round.id || index} className={styles.item}>
            {index !== rounds.length - 1 && <div className={`${styles.itemLine} ${lineClass}`} />}
            <div className={`${styles.iconContainer} ${iconBgClass}`}>
              <IconComponent size={24} weight="fill" color={iconColor} />
            </div>
            <div className={styles.cardWrapper}>
              <SubmissionRoundCard round={round} role={role} />
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default SubmissionList;
